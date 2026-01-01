import { baserowService } from '$lib/services/baserow';
import { stripeService } from '$lib/services/stripe';
import { emailService } from '$lib/services/resend';

export async function createBooking({
    clientId,
    customer,
    quote,
    propertyData,
    serviceDateTime,
    depositRate = 0.25,
}) {
    try {
        // 1. Create property
        const property = await baserowService.properties.create({
            'Street Address': propertyData.streetAddress || '',
            City: propertyData.city || '',
            State: propertyData.state || '',
            Zip: propertyData.zipcode ? Number(propertyData.zipcode) : null,
            Status: 4520770, // Lead
            Contact: clientId ? [clientId] : [],
            'Property Type': propertyData.propertyType ? Number(propertyData.propertyType) : null,
            Bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
            Bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
            Sqft: propertyData.sqft ? Number(propertyData.sqft) : null,
        });

        // 2. Create/find Stripe customer
        const stripeCustomer = await stripeService.customers.create({
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone,
            metadata: {
                clientId,
                propertyId: property.id,
            },
        });

        // 3. Create deposit invoice
        const depositAmount = quote.total * depositRate;
        const invoice = await stripeService.invoices.createDeposit({
            customerId: stripeCustomer.id,
            amount: depositAmount,
            totalAmount: quote.total,
            dueInDays: 7,
            metadata: {
                quote_total: quote.total,
                deposit_rate: depositRate,
                property_id: property.id,
            },
        });

        // 4. Send email
        // await emailService.sendDepositInvoice({
        //     to: customer.email,
        //     firstName: customer.firstName,
        //     invoiceUrl: invoice.hosted_invoice_url,
        //     depositAmount,
        //     totalAmount: quote.total,
        // });

        // 5. Create job
        const job = await baserowService.jobs.create({
            'Scheduled Start': `${serviceDateTime}:00-07:00`,
            'Status': 'Deposit Pending', // "Deposit Pending" or whatever ID that is
            'Job Type': 'First Clean', // First Clean
            Contact: [clientId],
            Property: [property.id],
            'Total': quote.total,
            'Deposit Amount': Math.floor(depositAmount),
            'Deposit Invoice ID': invoice.id,
            'Deposit Paid': false, 
            'Final Invoice ID': null
        });

        // return {
        //     success: true,
        //     jobId: job.id,
        //     propertyId: property.id,
        //     invoiceUrl: invoice.hosted_invoice_url,
        //     depositAmount,
        // };
    } catch (error) {
        console.error('Booking creation failed:', error);
        throw error;
    }
}
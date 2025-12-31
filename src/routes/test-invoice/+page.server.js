import Stripe from 'stripe';
import { Resend } from 'resend';
import { STRIPE_SECRET_KEY } from "$env/static/private";
import { RESEND_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);
const resend = new Resend(RESEND_KEY);

export const actions = {
    testInvoice: async () => {
        try {
            const testEmail = 'test@example.com';
            const testName = 'John Doe';
            const testPhone = '555-1234';
            const estimatedPrice = 2000;
            const depositAmount = 500;

            console.log('Looking for existing customer...');

            // 1. Check if customer already exists in Stripe
            const existingCustomers = await stripe.customers.list({
                email: testEmail,
                limit: 1,
            });

            let stripeCustomer;

            if (existingCustomers.data.length > 0) {
                // Customer exists, reuse it
                stripeCustomer = existingCustomers.data[0];
                console.log('Found existing customer:', stripeCustomer.id);
            } else {
                // Create new customer
                stripeCustomer = await stripe.customers.create({
                    email: testEmail,
                    name: testName,
                    phone: testPhone,
                    metadata: {
                        test: 'true',
                        property_id: '12345',
                    },
                });
                console.log('Created new customer:', stripeCustomer.id);
            }

            // 2. Create invoice
            const invoice = await stripe.invoices.create({
                customer: stripeCustomer.id,
                collection_method: 'send_invoice',
                days_until_due: 7,
                description: 'Test Property #12345 - Cleaning Service Deposit',
                metadata: {
                    property_id: '12345',
                    booking_type: 'deposit',
                    test: 'true',
                },
            });

            console.log('Invoice created:', invoice.id);

            // 3. Add invoice item
            await stripe.invoiceItems.create({
                customer: stripeCustomer.id,
                amount: depositAmount * 100,
                currency: 'usd',
                description: `Service Deposit (25% of $${estimatedPrice})`,
                invoice: invoice.id,
            });

            // 4. Finalize invoice
            const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

            console.log('Invoice finalized:', finalizedInvoice.hosted_invoice_url);

            return {
                success: true,
                invoiceUrl: finalizedInvoice.hosted_invoice_url,
                invoiceId: invoice.id,
                customerId: stripeCustomer.id,
                customerWasNew: existingCustomers.data.length === 0,
                depositAmount: depositAmount,
            };

        } catch (error) {
            console.error('Error creating invoice:', error);
            return {
                success: false,
                error: error.message,
                errorDetails: error.toString(),
            };
        }
    },

    testEmail: async () => {
        try {
            const { data, error } = await resend.emails.send({
                from: 'Minty Clean <hello@notifications.callminty.com>', // must be a verified sender/domain
                to: ['gaegeroot@gmail.com'],        // replace with your email
                subject: 'Just a test email',
                html: '<p>Testing that this works 🎉</p>',
                replyTo: 'hello@notifications.callminty.com',
            });

            if (error) {
                console.error('Resend API error:', error);
                return {
                    success: false,
                    error: error.message ?? 'Resend returned an error'
                };
            }

            return {
                success: true,
                messageId: data.id
            };
        } catch (error) {
            console.error('Error sending email:', error);

            return {
                success: false,
                error: error.message,
                errorDetails: error.toString(),
            };
        }
    }
};
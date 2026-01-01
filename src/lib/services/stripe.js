import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const stripeService = {
    customers: {
        create: async ({ email, name, phone, metadata }) => {
            return stripe.customers.create({
                email,
                name,
                phone,
                metadata,
            });
        },
        
        findOrCreate: async ({ email, name, phone, metadata }) => {
            // Check if exists
            const existing = await stripe.customers.list({ email, limit: 1 });
            
            if (existing.data.length > 0) {
                return existing.data[0];
            }
            
            // Create new
            return stripe.customers.create({ email, name, phone, metadata });
        },
    },
    
    invoices: {
        createDeposit: async ({ 
            customerId, 
            amount, 
            totalAmount, 
            dueInDays = 7,
            metadata = {} 
        }) => {
            // Create draft invoice
            const invoice = await stripe.invoices.create({
                customer: customerId,
                collection_method: 'send_invoice',
                days_until_due: dueInDays,
                auto_advance: false,
                metadata,
            });
            
            // Add line item
            await stripe.invoiceItems.create({
                customer: customerId,
                invoice: invoice.id,
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                description: `Cleaning Service Deposit (25% of $${totalAmount.toFixed(2)})`,
            });
            
            // Finalize
            const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
            
            return finalized;
        },
    },
};
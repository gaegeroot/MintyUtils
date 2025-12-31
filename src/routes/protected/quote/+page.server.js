import Stripe from 'stripe';
import { Resend } from 'resend';
import { STRIPE_SECRET_KEY } from "$env/static/private";
import { RESEND_KEY } from '$env/static/private';
import { BASEROW_TOKEN } from "$env/static/private";

const stripe = new Stripe(STRIPE_SECRET_KEY);
const resend = new Resend(RESEND_KEY);
const BASEROW_API_URL = 'https://api.baserow.io/api/database/rows/table';
const CONTACTS_TABLE_ID = '743341';
const PROPERTIES_TABLE_ID = '743340';

// HELPERS

const num = (v) => (v ? Number(v) : null);

const toISODateTime = (date, time) => {
    return new Date(`${date}T${time}`).toISOString();
};


export const actions = {
    createClient: async ({ request }) => {
        const data = await request.formData();

        const payload = {
            'First Name': data.get('firstName'),
            'Last Name': data.get('lastName'),
            'Email': data.get('email'),
            'Phone': data.get('phone'),

            'Status': 'Lead',
            'Lead Status': 'New',
            'Type': ['Residential'],

            'SMS Consent': data.get('smsConsent') === 'on',
            'Email Consent': true,
        };

        const res = await fetch(
            `${BASEROW_API_URL}/${CONTACTS_TABLE_ID}/?user_field_names=true`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Token ${BASEROW_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!res.ok) {
            const error = await res.json();
            console.error('Baserow error:', error);
            return {
                success: false,
                error: 'Failed to create contact'
            };
        }

        const createdRow = await res.json();

        return {
            success: true,
            clientId: createdRow.id
        };
    },

    createProperty: async ({ request }) => {
        const d = await request.formData();
        const has = (n) => d.has(n);

        // Helper to safely parse numbers
        const num = (v) => (v ? Number(v) : null);

        const payload = {
            // Address
            'Street Address': d.get('streetAddress') || '',
            City: d.get('city') || '',
            State: d.get('state') || '',
            Zip: num(d.get('zipcode')),

            // Meta
            Status: 4520770, // Lead
            Contact: d.get('clientId') ? [num(d.get('clientId'))] : [],

            // Property core
            'Property Type': num(d.get('propertyType')),
            Bedrooms: num(d.get('bedrooms')),
            Bathrooms: num(d.get('bathrooms')),
            Sqft: num(d.get('sqft')),

            // Schedule
            'Desired Schedule': num(d.get('desiredSchedule')),

            // Access & Floor
            'Access Difficulty': d.get('accessDifficulty') ? Number(d.get('accessDifficulty')) : null,
            'Floor / Level': num(d.get('floorLevel')),

            // Binary flags
            'Previously Cleaned Experience': has('firstTimeClean'), // Maps to Previous Cleaning Experience
            'Recently Cleaned (≤ 2 months)': has('recentClean'),
            'Smoke / Pests / Mold History': has('smokePestsMold'),
            'Move-in / Move-out': has('moveInOut'),
            'Pets Present': has('pets'),
            'Fragile / High-value Items / Clutter': has('fragileItems'),
            'Urgent Timeline (≤ 7 days)': has('urgentTimeline'),

            // Notes
            Notes: d.get('notes') || '',

            // Optional/Not in form — you may consider adding these later
            'Finished Basement': false, // checkbox could be added
            'Ladder / High Reach Required': false, // checkbox could be added
        };

        try {
            const res = await fetch(
                `${BASEROW_API_URL}/743340/?user_field_names=true`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${BASEROW_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const err = await res.json();
                console.error('Baserow error:', err);
                return { success: false, error: err };
            }

            return { success: true };
        } catch (error) {
            console.error('Network error:', error);
            return { success: false, error };
        }
    },

    finalizeBooking: async ({ request }) => {
        const d = await request.formData();

        const clientId = num(d.get('clientId'));
        const customer = JSON.parse(d.get('customer'));

        // const serviceDate = d.get('serviceDate');
        // const serviceTime = d.get('serviceTime');
        // const scheduledStart = toISODateTime(serviceDate, serviceTime);

        try {
            /*
             * 1. CREATE PROPERTY
             */
            const propertyPayload = {
                'Street Address': d.get('streetAddress') || '',
                City: d.get('city') || '',
                State: d.get('state') || '',
                Zip: num(d.get('zipcode')),

                Status: 4520770, // Lead
                Contact: clientId ? [clientId] : [],

                'Property Type': num(d.get('propertyType')),
                Bedrooms: num(d.get('bedrooms')),
                Bathrooms: num(d.get('bathrooms')),
                Sqft: num(d.get('sqft')),
            };

            const propertyRes = await fetch(
                `${BASEROW_API_URL}/743340/?user_field_names=true`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${BASEROW_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(propertyPayload),
                }
            );

            if (!propertyRes.ok) throw new Error('Property creation failed');
            const property = await propertyRes.json();

            /*
             * 2. STRIPE CUSTOMER
             */
            const stripeCustomer = await stripe.customers.create({
                email: customer.email,
                name: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone,
                metadata: {
                    clientId,
                    propertyId: property.id,
                },
            });

            /*
            * 3. INVOICE
            */

            // 1️⃣ Create invoice FIRST (draft)
            const invoice = await stripe.invoices.create({
                customer: stripeCustomer.id,
                collection_method: 'send_invoice',
                days_until_due: 7,
                auto_advance: false,
            });

            // 2️⃣ Attach line item DIRECTLY to invoice
            await stripe.invoiceItems.create({
                customer: stripeCustomer.id,
                invoice: invoice.id,
                amount: 15000,
                currency: 'usd',
                description: 'Cleaning Service – Initial Cleaning',
            });

            // 3️⃣ Finalize invoice
            const finalizedInvoice =
                await stripe.invoices.finalizeInvoice(invoice.id);

            /*
             * 4. SEND EMAIL (RESEND)
             */
            await resend.emails.send({
                from: 'Minty Clean <hello@notifications.callminty.com>',
                to: customer.email,
                subject: 'Your Cleaning Invoice',
                html: `
                    <p>Hi ${customer.firstName},</p>
                    <p>Your invoice is ready:</p>
                    <p><a href="${finalizedInvoice.hosted_invoice_url}">View & Pay Invoice</a></p>
                `,
            });

            /*
             * 5. CREATE JOB
             */
            // const jobPayload = {
            //     'Scheduled Start': scheduledStart,
            //     Status: 4523819, // Scheduled
            //     'Job Type': 4520788, // First Clean
            //     Contact: [clientId],
            //     Property: [property.id],
            //     Revenue: 150,
            //     'Stripe Invoice ID': invoice.id,
            //     'Invoice Status': 4844417, // Unpaid
            // };

            // const jobRes = await fetch(
            //     `${BASEROW_API_URL}/743342/?user_field_names=true`,
            //     {
            //         method: 'POST',
            //         headers: {
            //             Authorization: `Token ${BASEROW_TOKEN}`,
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify(jobPayload),
            //     }
            // );

            // if (!jobRes.ok) throw new Error('Job creation failed');
            // const job = await jobRes.json();

            // return {
            //     success: true,
            //     jobId: job.id,
            //     invoiceUrl: invoice.hosted_invoice_url,
            // };
        } catch (err) {
            console.error(err);
            return { success: false, error: err.message };
        }
    }
};

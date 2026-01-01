import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { BASEROW_TOKEN } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);
const BASEROW_API_URL = 'https://api.baserow.io/api/database/rows/table';
const JOBS_TABLE_ID = '743343';

export async function POST({ request }) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle invoice.paid event
    if (event.type === 'invoice.paid') {
        const invoice = event.data.object;
        const invoiceId = invoice.id;

        console.log(`Invoice paid: ${invoiceId}`);

        try {
            // Search for job with this deposit invoice ID
            const depositJobsRes = await fetch(
                `${BASEROW_API_URL}/${JOBS_TABLE_ID}/?user_field_names=true&filter__field_Deposit Invoice ID__equal=${invoiceId}`,
                {
                    headers: {
                        Authorization: `Token ${BASEROW_TOKEN}`,
                    }
                }
            );

            const depositJobs = await depositJobsRes.json();

            if (depositJobs.results && depositJobs.results.length > 0) {
                const job = depositJobs.results[0];

                console.log(`Found job ${job.id} with deposit invoice ${invoiceId}`);

                // Update job: mark deposit as paid, change status to "Scheduled"
                await fetch(
                    `${BASEROW_API_URL}/${JOBS_TABLE_ID}/${job.id}/?user_field_names=true`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Token ${BASEROW_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'Status': 'Scheduled'
                        }),
                    }
                );

                console.log(`Updated job ${job.id} - deposit marked as paid`);

                return json({
                    received: true,
                    jobId: job.id,
                    invoiceType: 'deposit',
                    message: 'Deposit invoice marked as paid'
                });
            }

            // Search for job with this final invoice ID
            const finalJobsRes = await fetch(
                `${BASEROW_API_URL}/${JOBS_TABLE_ID}/?user_field_names=true&filter__field_Final Invoice ID__equal=${invoiceId}`,
                {
                    headers: {
                        Authorization: `Token ${BASEROW_TOKEN}`,
                    }
                }
            );

            const finalJobs = await finalJobsRes.json();

            if (finalJobs.results && finalJobs.results.length > 0) {
                const job = finalJobs.results[0];

                console.log(`Found job ${job.id} with final invoice ${invoiceId}`);

                // Update job: mark final as paid, change status to "Paid in Full"
                await fetch(
                    `${BASEROW_API_URL}/${JOBS_TABLE_ID}/${job.id}/?user_field_names=true`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Token ${BASEROW_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'Final Paid': true,
                            'Status': 4523821, // Update to your "Paid in Full" status ID
                        }),
                    }
                );

                console.log(`Updated job ${job.id} - final invoice marked as paid`);

                return json({
                    received: true,
                    jobId: job.id,
                    invoiceType: 'final',
                    message: 'Final invoice marked as paid'
                });
            }

            // Invoice not found in any job
            console.log(`No job found for invoice ${invoiceId}`);
            return json({
                received: true,
                message: 'Invoice not associated with any job'
            });

        } catch (error) {
            console.error('Error updating job:', error);
            return json({ error: error.message }, { status: 500 });
        }
    }

    // Return 200 for other event types
    return json({ received: true, type: event.type });
}
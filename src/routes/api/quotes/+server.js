import { json } from '@sveltejs/kit';
import { calculateQuote } from '$lib/pricing';

export async function POST({ request }) {
    try {
        const data = await request.json();
        
        // Calculate quote server-side (never trust client)
        const quote = calculateQuote({
            property: data.property,
            addOns: data.addOns,
            conditions: data.conditions,
            schedule: data.schedule
        });

        return json({ quote });
    } catch (error) {
        console.error('Quote calculation failed:', error);
        return json(
            { error: error.message },
            { status: 500 }
        );
    }
}
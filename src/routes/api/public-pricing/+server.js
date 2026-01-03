import { PRICING, calculateQuote } from '$lib/pricing';
import { json } from '@sveltejs/kit';

export async function GET() {
    return json(
        {
            PRICING,
            calculateQuote: calculateQuote.toString()
        },
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        }
    );
}
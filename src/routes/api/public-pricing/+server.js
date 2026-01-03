import { PRICING, calculateQuote } from '$lib/pricing';

export async function GET() {

  return new Response(
    JSON.stringify({
      PRICING,
      calculateQuote: calculateQuote.toString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
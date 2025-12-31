<script>
  import QuoteCalculator from '$lib/components/quote/QuoteCalculator.svelte';
</script>

<svelte:head>
  <title>Internal Quote Calculator</title>
  <meta name="description" content="Generate cleaning estimates for clients" />
  <script
    async
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_API_KEY&libraries=places&v=beta"
  ></script>
</svelte:head>

<div class="min-h-screen bg-gray-100 py-10">
  <h1 class="text-3xl font-bold text-center mb-8">Internal Quote Calculator</h1>

  <QuoteCalculator />
</div>

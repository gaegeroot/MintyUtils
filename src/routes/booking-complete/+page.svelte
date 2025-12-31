<script>
  import { page } from '$app/stores';
  
  // Get booking data from URL params or page data
  export let data;
  
  const {
    total,
    sqft,
    bathrooms,
    firstTimeClean,
    moveInOut,
    pets,
    fragileItems,
    urgentTimeline,
    accessDifficulty,
    schedule
  } = data.booking;

  const PRICING = data.pricing;
</script>

<svelte:head>
  <title>Booking Complete - Call Script</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10">
  <div class="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
    <h2 class="text-2xl font-bold text-green-900 mb-2">✓ Booking Submitted Successfully</h2>
    <p class="text-green-700">Follow the guide below to close out the customer call professionally.</p>
  </div>

  <!-- Customer Script -->
  <section class="mb-8 bg-white border border-gray-200 rounded-lg p-6">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Step 1</span>
      Read to Customer
    </h3>
    
    <div class="space-y-4 bg-gray-50 p-4 rounded-md border-l-4 border-blue-500">
      <p class="font-medium">"Great! I've got you all set for [DATE] at [TIME]."</p>
      
      <div class="space-y-2">
        <p class="font-medium">Confirm the details:</p>
        <ul class="list-disc list-inside space-y-1 ml-4">
          <li>Total price: ${total.toFixed(2)}</li>
          <li>Service includes: {sqft.toLocaleString()} sqft, {bathrooms} bathroom{bathrooms === 1 ? '' : 's'}</li>
          {#if firstTimeClean}<li>First Time Clean added</li>{/if}
          {#if moveInOut}<li>Move In/Out service</li>{/if}
        </ul>
      </div>

      <div class="space-y-2">
        <p class="font-medium">"Here's what happens next:"</p>
        <ul class="list-disc list-inside space-y-1 ml-4">
          <li>"You'll receive a confirmation email within 5 minutes with all the details"</li>
          <li>"We'll send you a reminder 24 hours before your appointment"</li>
          <li>"You'll get a text when our team is on the way, usually 15-30 minutes before arrival"</li>
        </ul>
      </div>

      <div class="space-y-2">
        <p class="font-medium">"A few important reminders:"</p>
        <ul class="list-disc list-inside space-y-1 ml-4">
          <li>"Please ensure someone 18 or older is home to let our team in, or provide access instructions"</li>
          <li>"We'll charge your card after the service is complete and send you a receipt via email"</li>
          <li>"If you need to reschedule, please give us at least 24 hours notice to avoid the ${PRICING.conditionFees.urgentTimeline.price} cancellation fee"</li>
          {#if firstTimeClean}<li>"Since this is a first-time deep clean, it may take a bit longer than our regular maintenance cleans"</li>{/if}
          {#if pets}<li>"Our team is comfortable with pets - just let us know the best way to handle them during the clean"</li>{/if}
        </ul>
      </div>

      <p class="font-medium">"Do you have any questions about the booking or the service?"</p>
      
      <p class="font-medium">"Perfect! We look forward to cleaning your home. Have a great day!"</p>
    </div>
  </section>

  <!-- Post-Call Actions -->
  <section class="mb-8 bg-white border border-gray-200 rounded-lg p-6">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Step 2</span>
      Post-Call Actions
    </h3>

    <div class="space-y-4">
      <div class="border-l-4 border-purple-500 pl-4">
        <h4 class="font-semibold mb-2">Verify Booking Details</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Double-check address in Google Maps</li>
          <li>Verify phone number format is correct</li>
          <li>Confirm email doesn't have typos</li>
          <li>Review any special instructions or access codes</li>
        </ul>
      </div>

      <div class="border-l-4 border-purple-500 pl-4">
        <h4 class="font-semibold mb-2">Flag Special Requirements</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          {#if pets}<li class="text-orange-600 font-medium">⚠ PETS PRESENT - Brief cleaning team</li>{/if}
          {#if fragileItems}<li class="text-orange-600 font-medium">⚠ FRAGILE ITEMS/CLUTTER - Extra care needed</li>{/if}
          {#if urgentTimeline}<li class="text-red-600 font-medium">🚨 RUSH SERVICE - Schedule ASAP</li>{/if}
          {#if moveInOut}<li class="text-blue-600 font-medium">📦 MOVE IN/OUT - Expect empty/partially empty home</li>{/if}
          {#if accessDifficulty !== 'easy'}<li class="text-orange-600 font-medium">⚠ {PRICING.accessDifficulty[accessDifficulty].label.toUpperCase()}</li>{/if}
          {#if !pets && !fragileItems && !urgentTimeline && !moveInOut && accessDifficulty === 'easy'}
            <li class="text-green-600">✓ Standard service - no special flags</li>
          {/if}
        </ul>
      </div>

      <div class="border-l-4 border-purple-500 pl-4">
        <h4 class="font-semibold mb-2">Update CRM</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Log call notes and any customer concerns</li>
          <li>Record specific problem areas mentioned</li>
          <li>Note if customer was referred by someone</li>
          <li>Set up post-service feedback request (24 hours after)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Red Flags -->
  <section class="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
    <h3 class="text-xl font-bold mb-4 text-red-900">🚩 Red Flags to Watch For</h3>
    <ul class="list-disc list-inside space-y-2 text-sm">
      <li>Customer mentioned extreme hoarding or biohazard situations</li>
      <li>Address is outside normal service area</li>
      <li>Customer has history of multiple reschedules</li>
      <li>Unrealistic expectations about what can be cleaned in timeframe</li>
      <li>Customer seemed unclear about pricing or tried to negotiate heavily</li>
    </ul>
    <p class="mt-4 text-sm text-red-800 font-medium">If any red flags were present, notify your supervisor before confirming the booking.</p>
  </section>

  <!-- Action Buttons -->
  <div class="flex gap-4">
    <a 
      href="/booking-form"
      class="flex-1 rounded-md bg-black px-6 py-3 text-white text-center font-medium hover:bg-gray-800 transition"
    >
      New Booking
    </a>
    <a 
      href="/dashboard" 
      class="flex-1 rounded-md border-2 border-black px-6 py-3 text-center font-medium hover:bg-gray-100 transition"
    >
      Back to Dashboard
    </a>
  </div>
</div>
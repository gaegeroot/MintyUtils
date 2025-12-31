<script>
  import { onMount } from 'svelte';
  import ClientInfoForm from './ClientInfoForm.svelte';
  import PropertyQuoteForm from './PropertyQuoteForm.svelte';
  import ScheduleForm from './ScheduleForm.svelte';
  import LiveQuote from './LiveQuote.svelte';
  import { PRICING, calculateQuote } from '$lib/pricing';

  let step = 2;
  let clientId = null;

  // Domain state
  let property = {
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1200,
    type: 4523726,
    accessDifficulty: '4814194'
  };

  let addOns = {
    firstTimeClean: false,
    insideOven: false,
    emptyFridge: false,
    fullFridge: false,
  };

  let conditions = {
    smokePestsMold: false,
    urgentTimeline: false,
    pets: false,
    moveInOut: false,
    fragileItems: false,
  };

  let schedule = 'One-time';
  $: quote = calculateQuote({ property, addOns, conditions, schedule });

  // Step 3: day/time
  let selectedDate = null;
  let selectedTime = null;

  function handleClientCreated(event) {
    clientId = event.detail.clientId;
    step = 2;
  }

  function nextStep() {
    step += 1;
  }
</script>

<div class="flex gap-8 max-w-7xl mx-auto">
  <div class="flex-1">
    {#if step === 1}
      <ClientInfoForm on:clientCreated={handleClientCreated} />
    {:else if step === 2}
      <PropertyQuoteForm
        bind:property
        bind:addOns
        bind:conditions
        bind:schedule
        clientId={clientId}
        on:nextStep={nextStep}
      />
    {:else if step === 3}
      <ScheduleForm bind:selectedDate bind:selectedTime />
    {/if}
  </div>

  {#if step === 2}
    <LiveQuote {property} {addOns} {conditions} {schedule} {quote} />
  {/if}
</div>

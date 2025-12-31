<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { PRICING, calculateQuote } from '$lib/pricing';

  export let property;
  export let addOns;
  export let conditions;
  export let schedule;
  export let clientId;

  const dispatch = createEventDispatcher();

  const bedroomLabel = (v) => `${v} Bedroom${v === 1 ? '' : 's'}`;
  const bathroomLabel = (v) => `${v} Bathroom${v <= 1 ? '' : 's'}`;

  let address = { streetAddress: '', city: '', state: '', zipcode: '' };
  let suggestions = [];
  let addressInputEl;
  let sessionToken;

  const PROPERTY_TYPES = {
    SFH: 4523726,
    Apartment: 4523727,
    Condo: 4523728,
    Office: 4523729,
    LargeCommercial: 4523730,
  };
  const MULTISTORY_TYPES = [4523727, 4523728, 4523729, 4523730];
  $: showAccessFields = MULTISTORY_TYPES.includes(Number(property.type));

  const DESIRED_SCHEDULE = {
    'One-time': 4524268,
    Weekly: 4524264,
    'Bi-weekly': 4524265,
    Monthly: 4524266,
  };
  const scheduleOptions = Object.keys(PRICING.scheduleDiscounts);

  const addOnKeys = Object.keys(PRICING.addOns);
  const conditionKeys = Object.keys(PRICING.conditionFees);

  $: quote = calculateQuote({ property, addOns, conditions, schedule });

  onMount(() => {
    if (window.google?.maps?.places)
      sessionToken = new google.maps.places.AutocompleteSessionToken();
  });

  function nextStep() {
    dispatch('nextStep');
  }

  async function onAddressInput(e) {
    const input = e.target.value;
    address.streetAddress = input;
    if (!input || input.length < 3) {
      suggestions = [];
      return;
    }

    const request = {
      input,
      sessionToken,
      locationBias: { west: -125, east: -113, north: 49, south: 32 },
    };
    const { suggestions: results } =
      await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
        request,
      );
    suggestions = results;
  }

  async function selectSuggestion(prediction) {
    const place = prediction.placePrediction.toPlace();
    await place.fetchFields({
      fields: ['addressComponents', 'formattedAddress'],
    });
    address.streetAddress = place.formattedAddress;
    suggestions = [];

    for (const c of place.addressComponents) {
      if (c.types.includes('locality')) address.city = c.longText;
      if (c.types.includes('administrative_area_level_1'))
        address.state = c.shortText;
      if (c.types.includes('postal_code')) address.zipcode = c.longText;
    }

    sessionToken = new google.maps.places.AutocompleteSessionToken();
  }
</script>

<form
  method="POST"
  action="?/createProperty"
  class="max-w-4xl mx-auto px-4 py-10 space-y-10"
>
  <input type="hidden" name="clientId" value={clientId} />

  <!-- Service Address -->
  <section class="space-y-4 relative">
    <h3 class="text-xl font-semibold">Service Address</h3>

    <input
      bind:this={addressInputEl}
      value={address.streetAddress}
      name="streetAddress"
      placeholder="Start typing address..."
      required
      class="w-full rounded-md border px-3 py-2"
      on:input={onAddressInput}
      autocomplete="off"
    />

    {#if suggestions.length}
      <ul
        class="absolute z-50 bg-white border rounded-md w-full shadow mt-1 max-h-60 overflow-auto"
      >
        {#each suggestions as s}
          <li
            class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            on:click={() => selectSuggestion(s)}
          >
            {s.placePrediction.text.text}
          </li>
        {/each}
      </ul>
    {/if}

    <input
      name="address2"
      placeholder="Address Line 2 (optional)"
      class="w-full rounded-md border px-3 py-2"
    />

    <div class="grid md:grid-cols-3 gap-4">
      <input
        name="city"
        bind:value={address.city}
        placeholder="City"
        class="rounded-md border px-3 py-2"
      />
      <input
        name="state"
        bind:value={address.state}
        placeholder="State"
        class="rounded-md border px-3 py-2"
      />
      <input
        name="zipcode"
        bind:value={address.zipcode}
        placeholder="ZIP Code"
        class="rounded-md border px-3 py-2"
      />
    </div>
  </section>

  <!-- Property Details -->
  <section class="space-y-6">
    <h3 class="text-xl font-semibold">Property Details</h3>
    <label class="block text-sm font-medium"
      >Property Type
      <select
        bind:value={property.type}
        name="propertyType"
        required
        class="mt-1 w-full rounded-md border px-3 py-2"
      >
        <option value="">Select</option>
        {#each Object.entries(PROPERTY_TYPES) as [key, id]}
          <option value={id}>{key.replace(/([A-Z])/g, ' $1').trim()}</option>
        {/each}
      </select>
    </label>

    {#if showAccessFields}
      <section class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >Access difficulty</label
            >
            <select
              bind:value={property.accessDifficulty}
              class="w-full rounded-md border px-3 py-2"
              name="accessDifficulty"
            >
              {#each Object.entries(PRICING.accessDifficulty) as [id, option]}
                <option value={id}>
                  {option.label} (+${option.price})
                </option>
              {/each}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Floor / level</label>
            <input
              type="number"
              name="floorLevel"
              min="1"
              placeholder="e.g. 3"
              class="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>
    {/if}

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Bedrooms -->
      <div>
        <label class="block text-sm font-medium mb-1">Bedrooms</label>
        <input
          type="range"
          min="0"
          max="6"
          bind:value={property.bedrooms}
          class="w-full"
          name="bedrooms"
        />
        <p class="mt-1 text-sm text-gray-600">
          {bedroomLabel(property.bedrooms)}
        </p>
      </div>

      <!-- Bathrooms -->
      <div>
        <label class="block text-sm font-medium mb-1">Bathrooms</label>
        <input
          type="range"
          min="1"
          max="6"
          step="0.5"
          bind:value={property.bathrooms}
          class="w-full"
          name="bathrooms"
        />
        <p class="mt-1 text-sm text-gray-600">
          {bathroomLabel(property.bathrooms)}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Count bathrooms with only a toilet and sink as a half bathroom
        </p>
      </div>

      <!-- Square Feet -->
      <div>
        <label class="block text-sm font-medium mb-1">Square Feet</label>
        <input
          type="range"
          min="300"
          max="10000"
          step="100"
          bind:value={property.sqft}
          class="w-full"
          name="sqft"
        />
        <p class="mt-1 text-sm text-gray-600">
          About {property.sqft.toLocaleString()} sqft
        </p>
      </div>
    </div>
  </section>

  <!-- Add-Ons -->
  <section class="space-y-4">
    <h3 class="text-xl font-semibold">Add-On Services</h3>
    <div class="space-y-3">
      {#each addOnKeys as key}
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            bind:checked={addOns[key]}
            class="rounded border-gray-300"
          />
          <span class="text-sm"
            >{PRICING.addOns[key].label} (+${PRICING.addOns[key].price.toFixed(
              2,
            )})</span
          >
        </label>
      {/each}
    </div>
  </section>

  <!-- Cleaning Schedule -->
  <section class="space-y-4">
    <label class="block text-xl font-semibold mb-2"
      >Preferred cleaning schedule</label
    >
    <input
      type="hidden"
      name="desiredSchedule"
      value={DESIRED_SCHEDULE[schedule]}
    />
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      {#each scheduleOptions as option}
        <button
          type="button"
          on:click={() => (schedule = option)}
          class="rounded-md border px-3 py-2 text-sm transition {schedule ===
          option
            ? 'bg-black text-white'
            : 'bg-white text-gray-700'}"
        >
          {option}
          {#if PRICING.scheduleDiscounts[option] > 0}
            <span class="block text-xs"
              >(-{(PRICING.scheduleDiscounts[option] * 100).toFixed(0)}%)</span
            >
          {/if}
        </button>
      {/each}
    </div>
  </section>

  <!-- Home Conditions -->
  <section class="space-y-3">
    <h3 class="text-xl font-semibold">Home Conditions</h3>
    <label class="flex gap-2">
      <input type="checkbox" bind:checked={conditions.smokePestsMold} /> Smoke / pests
      / mold
    </label>
    {#if conditions.smokePestsMold}
      <p class="text-red-600 text-sm mt-2">
        We cannot accept bookings for properties with smoke, pests, or mold
        issues.
      </p>
    {/if}

    {#each conditionKeys.filter((k) => k !== 'smokePestsMold') as key}
      <label class="flex gap-2">
        <input type="checkbox" name={key} bind:checked={conditions[key]} />
        {PRICING.conditionFees[key].label} (+${PRICING.conditionFees[
          key
        ].price.toFixed(2)})
      </label>
    {/each}
  </section>

  <!-- Notes -->
  <label class="block text-xl font-semibold mb-2">Notes</label>
  <textarea name="notes" rows="4" class="w-full rounded-md border px-3 py-2"
  ></textarea>

  <button
    class="cursor-pointer rounded-md bg-black px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={conditions.smokePestsMold}
  >
    Submit Estimate Request
  </button>
</form>

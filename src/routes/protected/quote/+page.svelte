<script>
  import { enhance } from '$app/forms';
  import { PRICING, calculateQuote } from '$lib/pricing';

  // =======================
  // STEP STATE
  // =======================
  let step = 1;
  let clientId = null;

  let customer = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    smsConsent: false,
  };

  let property = {
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1200,
    type: 4523726,
    accessDifficulty: '4814194',
  };

  let selectedDateTime = '';

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

  const PROPERTY_TYPES = {
    SFH: 4523726,
    Apartment: 4523727,
    Condo: 4523728,
    Office: 4523729,
    LargeCommercial: 4523730,
  };
  const MULTISTORY_TYPES = [4523727, 4523728, 4523729, 4523730];

  $: showAccessFields = MULTISTORY_TYPES.includes(Number(property.type));

  $: {
    if (property.type) {
      const isMulti = MULTISTORY_TYPES.includes(Number(property.type));
      showAccessFields = isMulti;

      // Only reset if the property is single-story and the current value isn't already the default
      if (!isMulti && property.accessDifficulty !== '4814194') {
        property.accessDifficulty = '4814194';
      }
    }
  }

  const DESIRED_SCHEDULE = {
    'One-time': 4524268,
    Weekly: 4524264,
    'Bi-weekly': 4524265,
    Monthly: 4524266,
  };

  let addressInputEl;
  let suggestions = [];
  let sessionToken;

  let address = {
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
  };

  // =======================
  // HANDLERS
  // =======================
  function handleClientResult() {
    return async ({ result }) => {
      if (result?.type === 'success') {
        clientId = result.data.clientId;
        step = 2;
      }
    };
  }

  async function onAddressInput(e) {
    const input = e.target.value;
    address.streetAddress = input;

    if (!input || input.length < 3) {
      suggestions = [];
      return;
    }

    // ✅ CREATE TOKEN HERE
    if (!sessionToken) {
      sessionToken = new google.maps.places.AutocompleteSessionToken();
    }

    const request = {
      input,
      sessionToken,
      locationBias: {
        west: -125,
        east: -113,
        north: 49,
        south: 32,
      },
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

    // ✅ END SESSION COMPLETELY
    sessionToken = null;
  }

  const bedroomLabel = (v) => `${v} Bedroom${v === 1 ? '' : 's'}`;
  const bathroomLabel = (v) => `${v} Bathroom${v <= 1 ? '' : 's'}`;

  const addOnKeys = Object.keys(PRICING.addOns);
  const conditionKeys = Object.keys(PRICING.conditionFees);

  $: quote = calculateQuote({ property, addOns, conditions, schedule });
  const scheduleOptions = Object.keys(PRICING.scheduleDiscounts);
</script>

<svelte:head>
  <title>Internal Quote Calculator</title>
  <meta name="description" content="Generate cleaning estimates" />
  <script
    async
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBja16ZB97PBDnQ8yfAkdsQa5KeTMc5LKQ&libraries=places&v=beta"
  ></script>
</svelte:head>

<div class="flex gap-8 max-w-7xl mx-auto">
  <!-- =======================
      STEP 1: CLIENT INFO
    ======================== -->
  {#if step === 1}
    <form
      method="POST"
      action="?/createClient"
      use:enhance={handleClientResult}
      class="max-w-xl mx-auto space-y-6"
    >
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium"
            >First Name <span class="text-red-500">*</span></label
          >
          <input
            bind:value={customer.firstName}
            name="firstName"
            required
            placeholder="Enter your first name"
            class="mt-1 w-full rounded-md border px-3 py-2 focus:border-black focus:ring-black"
          />
        </div>
        <div>
          <label class="block text-sm font-medium"
            >Last Name <span class="text-red-500">*</span></label
          >
          <input
            bind:value={customer.lastName}
            name="lastName"
            required
            placeholder="Enter your last name"
            class="mt-1 w-full rounded-md border px-3 py-2 focus:border-black focus:ring-black"
          />
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium"
            >Email <span class="text-red-500">*</span></label
          >
          <input
            bind:value={customer.email}
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            class="mt-1 w-full rounded-md border px-3 py-2 focus:border-black focus:ring-black"
          />
        </div>
        <div>
          <label class="block text-sm font-medium">Phone Number</label>
          <input
            bind:value={customer.phone}
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            class="mt-1 w-full rounded-md border px-3 py-2 focus:border-black focus:ring-black"
          />
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input
          bind:value={customer.smsConsent}
          type="checkbox"
          name="smsConsent"
          class="rounded border-gray-300"
        />
        Ok to receive SMS related to service
        <span class="text-red-500">*</span>
      </label>

      <button
        class="cursor-pointer rounded-md bg-black px-6 py-3 text-white text-sm font-medium hover:bg-gray-800 transition"
      >
        Continue →
      </button>
    </form>
  {/if}

  <!-- =======================
    LIVE QUOTE SIDEBAR
  ======================== -->

  {#if step === 2}
    <div class="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      <!-- FORM COLUMN -->

      <form
        method="POST"
        action="?/finalizeBooking"
        class="max-w-4xl mx-auto px-4 py-10 space-y-10"
        id="property-form"
      >
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="customer" value={JSON.stringify(customer)} />
        <input type="hidden" name="quoteTotal" value={JSON.stringify(quote)} />

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
                <option value={id}
                  >{key.replace(/([A-Z])/g, ' $1').trim()}</option
                >
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
                  <label class="block text-sm font-medium mb-1"
                    >Floor / level</label
                  >
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
                  >{PRICING.addOns[key].label} (+${PRICING.addOns[
                    key
                  ].price.toFixed(2)})</span
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
                    >(-{(PRICING.scheduleDiscounts[option] * 100).toFixed(
                      0,
                    )}%)</span
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
            <input type="checkbox" bind:checked={conditions.smokePestsMold} /> Smoke
            / pests / mold
          </label>
          {#if conditions.smokePestsMold}
            <p class="text-red-600 text-sm mt-2">
              We cannot accept bookings for properties with smoke, pests, or
              mold issues.
            </p>
          {/if}

          {#each conditionKeys.filter((k) => k !== 'smokePestsMold') as key}
            <label class="flex gap-2">
              <input
                type="checkbox"
                name={key}
                bind:checked={conditions[key]}
              />
              {PRICING.conditionFees[key].label} (+${PRICING.conditionFees[
                key
              ].price.toFixed(2)})
            </label>
          {/each}
        </section>

        <!-- Date & Time Selection -->
        <section class="space-y-4">
          <h3 class="text-xl font-semibold">Preferred Cleaning Date & Time</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Date</label>
              <input
                type="datetime-local"
                bind:value={selectedDateTime}
                name="preferredDateTime"
                class="w-full rounded-md border px-3 py-2"
                required
              />
            </div>
          </div>
        </section>

        <!-- Notes -->
        <label class="block text-xl font-semibold mb-2">Notes</label>
        <textarea
          name="notes"
          rows="4"
          class="w-full rounded-md border px-3 py-2"
        ></textarea>
      </form>
      <aside
        class="w-80 sticky top-20 h-fit bg-gray-50 rounded-lg p-6 space-y-4"
      >
        <h2 class="text-2xl font-bold mb-4">Cleaning Plan</h2>
        <hr />
        {#if address.streetAddress}
          <div class="mb-4">
            <h2 class="text-lg font-semibold">Service Address</h2>
            <p class="text-sm text-gray-700">
              {address.streetAddress}{#if address.streetAddress && (address.city || address.state || address.zipcode)},
              {/if}
              {address.city}{#if address.city && (address.state || address.zipcode)},
              {/if}
              {address.state}
              {address.zipcode}
            </p>
          </div>
        {/if}

        {#if selectedDateTime}
          <div class="mb-4">
            <h2 class="text-lg font-semibold">Date & Time</h2>
            <span>
              {(() => {
                const [datePart, timePart] = selectedDateTime.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                let [hour, minute] = timePart.split(':').map(Number);

                const ordinal = (n) => {
                  const s = ['th', 'st', 'nd', 'rd'];
                  const v = n % 100;
                  return n + (s[(v - 20) % 10] || s[v] || s[0]);
                };

                const ampm = hour >= 12 ? 'pm' : 'am';
                hour = hour % 12 || 12;

                const monthName = new Date(year, month - 1, day).toLocaleString(
                  'en-US',
                  {
                    month: 'short',
                  },
                );

                return `${monthName} ${ordinal(day)} at ${hour}:${minute
                  .toString()
                  .padStart(2, '0')} ${ampm}`;
              })()}
            </span>
          </div>
        {/if}

        <h2 class="text-lg font-semibold">Services/Add-Ons</h2>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Base Price ({property.sqft.toLocaleString()} sqft)</span>
            <span>${quote.basePrice.toFixed(2)}</span>
          </div>

          <div class="flex justify-between text-sm">
            <span>{bedroomLabel(property.bedrooms)}</span>
          </div>

          <div class="flex justify-between text-sm">
            <span>{bathroomLabel(property.bathrooms)}</span>
            <span>${quote.bathroomCharge.toFixed(2)}</span>
          </div>

          {#if showAccessFields && quote.accessFee > 0}
            <div class="flex justify-between text-sm">
              <span
                >{PRICING.accessDifficulty[property.accessDifficulty]
                  ?.label}</span
              >
              <span>${quote.accessFee.toFixed(2)}</span>
            </div>
          {/if}

          {#each addOnKeys as key}
            {#if addOns[key]}
              <div class="flex justify-between text-sm">
                <span>{PRICING.addOns[key].label}</span>
                <span>${PRICING.addOns[key].price.toFixed(2)}</span>
              </div>
            {/if}
          {/each}

          {#each conditionKeys.filter((k) => k !== 'smokePestsMold') as key}
            {#if conditions[key]}
              <div class="flex justify-between text-sm">
                <span>{PRICING.conditionFees[key].label}</span>
                <span>${PRICING.conditionFees[key].price.toFixed(2)}</span>
              </div>
            {/if}
          {/each}
        </div>

        <div class="border-t pt-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${quote.subtotal.toFixed(2)}</span>
          </div>

          {#if quote.tax > 0}
            <div class="flex justify-between text-sm">
              <span>Tax ({(PRICING.taxRate * 100).toFixed(0)}%)</span>
              <span>${quote.tax.toFixed(2)}</span>
            </div>
          {/if}
        </div>

        <div class="border-t pt-4">
          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${quote.total.toFixed(2)}</span>
          </div>
        </div>

        {#if schedule !== 'One-time'}
          <div class="bg-green-50 border border-green-200 rounded-md p-3">
            <div class="text-sm text-green-800 font-medium mb-1">
              {schedule} Discount: {(quote.discount * 100).toFixed(0)}% off
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-700">Recurring Total:</span>
              <span class="font-bold text-green-900"
                >${quote.recurringTotal.toFixed(2)}</span
              >
            </div>
            <p class="text-xs text-green-600 mt-1">
              Applied from 2nd cleaning onwards
            </p>
          </div>
        {/if}
        <button
          type="submit"
          form="property-form"
          class="mt-6 w-full cursor-pointer rounded-md bg-black px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={conditions.smokePestsMold}
        >
          Submit
        </button>
      </aside>
    </div>
  {/if}
</div>

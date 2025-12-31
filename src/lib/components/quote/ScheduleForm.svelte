<script>
  export let selectedDate;
  export let selectedTime;
</script>

<section class="max-w-xl mx-auto space-y-6">
  <h2 class="text-xl font-semibold">Select Date & Time</h2>
  <label class="block">
    <span class="text-sm font-medium">Preferred Date</span>
    <input type="date" bind:value={selectedDate} class="mt-1 w-full rounded-md border px-3 py-2"/>
  </label>
  <label class="block">
    <span class="text-sm font-medium">Preferred Time</span>
    <input type="time" bind:value={selectedTime} class="mt-1 w-full rounded-md border px-3 py-2"/>
  </label>
</section>

<script>
  export let property;
  export let addOns;
  export let conditions;
  export let schedule;
  export let quote;
</script>

<aside class="w-80 sticky top-20 h-fit bg-gray-50 rounded-lg p-6 space-y-4">
  <h2 class="text-2xl font-bold mb-4">Cleaning Plan</h2>

  <div class="space-y-2">
    <div class="flex justify-between text-sm">
      <span>Base Price ({property.sqft.toLocaleString()} sqft)</span>
      <span>${quote.basePrice.toFixed(2)}</span>
    </div>
    <!-- add-ons, bedrooms, bathrooms, accessFee, etc -->
  </div>

  <div class="border-t pt-4 space-y-2">
    <div class="flex justify-between text-sm">
      <span>Subtotal</span>
      <span>${quote.subtotal.toFixed(2)}</span>
    </div>
    {#if quote.tax > 0}
      <div class="flex justify-between text-sm">
        <span>Tax</span>
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
</aside>

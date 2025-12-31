<script>
  import { createEventDispatcher } from 'svelte';
  import { enhance } from '$app/forms';
  const dispatch = createEventDispatcher();

  function handleClientResult() {
    return async ({ result }) => {
      if (result?.type === 'success') {
        dispatch('clientCreated', { clientId: result.data.clientId });
      }
    };
  }
</script>

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
        type="tel"
        name="phone"
        placeholder="Enter your phone number"
        class="mt-1 w-full rounded-md border px-3 py-2 focus:border-black focus:ring-black"
      />
    </div>
  </div>

  <label class="flex items-center gap-2 text-sm">
    <input type="checkbox" name="smsConsent" class="rounded border-gray-300" />
    Ok to receive SMS related to service
  </label>

  <button
    class="cursor-pointer rounded-md bg-black px-6 py-3 text-white text-sm font-medium hover:bg-gray-800 transition"
    >Continue →</button
  >
</form>

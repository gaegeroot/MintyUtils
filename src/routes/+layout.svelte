<script>
  import Header from './Header.svelte';
  import './styles.css'
  export let data;

  const user = data.user;
</script>

<div class="flex flex-col min-h-screen bg-gray-50">
  <!-- Header -->
  <Header {user} />

  <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
    {#if user}
      <!-- Dashboard view -->
      <slot />
    {:else}
      <!-- Centered login card -->
      <div class="flex items-center justify-center h-full">
        <div
          class="bg-white p-8 rounded-md shadow-md w-full max-w-sm text-center"
        >
          <h2 class="text-2xl font-semibold mb-4">Welcome</h2>
          <p class="mb-6">Please log in to access your dashboard.</p>
          <a
            href="/api/auth/login?returnUrl=/"
            class="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
          >
            Log In
          </a>
        </div>
      </div>
    {/if}
  </main>
</div>

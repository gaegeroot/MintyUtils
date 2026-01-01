<script>
  import { page } from '$app/stores';
  import { slide } from 'svelte/transition';
  import logo from '$lib/images/minty_logo.png';
  export let user;

  let mobileMenuOpen = false;
  let avatarMenuOpen = false;

  const toggleMobileMenu = () => mobileMenuOpen = !mobileMenuOpen;
  const toggleAvatarMenu = () => avatarMenuOpen = !avatarMenuOpen;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/protected/quote', label: 'Quote' },
  ];
</script>

<header class="sticky top-0 w-full border-b border-gray-200 bg-white z-50">
  <div class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
    <!-- Logo -->
    <a href="/" class="flex items-center">
      <img src={logo} alt="Minty Logo" class="h-8 w-auto md:h-10" />
    </a>

    <!-- Main nav + avatar container -->
    <div class="flex items-center space-x-4">
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
        {#each navLinks as link}
          <a
            href={link.href}
            class="hover:text-black transition-colors duration-150"
            aria-current={$page.url.pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </a>
        {/each}
      </nav>

      <!-- Avatar always visible -->
      {#if user}
        <div class="relative">
          <button
            class="flex items-center space-x-2 focus:outline-none"
            on:click={toggleAvatarMenu}
          >
            <img src={user.picture} alt="Avatar" class="w-8 h-8 rounded-full border border-gray-300" />
            <span class="hidden md:inline text-sm md:text-base font-medium">{user.name}</span>
          </button>

          {#if avatarMenuOpen}
            <div
              class="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              in:slide={{ duration: 200 }}
            >
              <ul class="py-2 text-sm text-gray-700">
                <li>
                  <a href="/profile" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
                </li>
                <li>
                  <a href="/api/auth/logout" class="block px-4 py-2 text-red-500 hover:bg-gray-100">Logout</a>
                </li>
              </ul>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Mobile Hamburger -->
      <button
        class="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
        on:click={toggleMobileMenu}
        aria-label="Toggle navigation"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          {#if !mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  {#if mobileMenuOpen}
    <div class="absolute top-full inset-x-0 md:hidden z-40">
      <div
        class="bg-white border-t border-gray-200 shadow-md"
        in:slide={{ duration: 250 }}
        out:slide={{ duration: 250 }}
      >
        <ul class="flex flex-col space-y-3 p-4">
          {#each navLinks as link}
            <li>
              <a
                href={link.href}
                class="block text-gray-700 font-medium hover:text-black"
                on:click={() => mobileMenuOpen = false}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</header>

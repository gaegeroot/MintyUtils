<script>
  import { page } from '$app/stores';
  import logo from '$lib/images/minty_logo.png';
  export let user;
</script>

<header class="w-full border-b border-gray-200 bg-white">
  <div
    class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4"
  >
    <!-- Logo -->
    <a href="/" class="flex items-center">
      <img src={logo} alt="Minty Logo" class="h-8 w-auto md:h-10" />
    </a>

    <!-- Navigation -->
    <nav>
      {#if user}
        <!-- Logged-in header -->
        <div class="flex items-center space-x-4">
          <div>
            <ul
              class="flex space-x-6 text-sm md:text-base font-medium text-gray-700"
            >
              <li>
                <a
                  href="/"
                  class="hover:text-black transition-colors duration-150"
                  aria-current={$page.url.pathname === '/' ? 'page' : undefined}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  class="hover:text-black transition-colors duration-150"
                  aria-current={$page.url.pathname === '/about'
                    ? 'page'
                    : undefined}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/protected"
                  class="hover:text-black transition-colors duration-150"
                  aria-current={$page.url.pathname.startsWith('/protected')
                    ? 'page'
                    : undefined}
                >
                  Protected
                </a>
              </li>
              <li>
                <a
                  href="/protected/quote"
                  class="hover:text-black transition-colors duration-150"
                  aria-current={$page.url.pathname.startsWith(
                    '/protected/quote',
                  )
                    ? 'page'
                    : undefined}
                >
                  Quote
                </a>
              </li>
            </ul>
          </div>
          <img
            src={user.picture}
            alt="Avatar"
            class="w-8 h-8 rounded-full border border-gray-300"
          />

          <span class="text-sm md:text-base font-medium text-gray-700">
            {user.name}
          </span>
          <a
            href="/api/auth/logout"
            class="text-sm md:text-base font-medium text-red-500 hover:underline"
          >
            Log out
          </a>
        </div>
      {:else}
        <!-- Logged-out header (current links preserved) -->
      {/if}
    </nav>
  </div>
</header>

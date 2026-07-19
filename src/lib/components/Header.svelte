<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Home, Film, Tv, Search, Heart, Settings, Menu, X, ArrowRight, AlertCircle } from "lucide-svelte";
  import Logo from "./Logo.svelte";
  import LiteModeBanner from "./LiteModeBanner.svelte";
  import QuickSearch from "./QuickSearch.svelte";

  let isScrolled = $state(false);
  let isMobileMenuOpen = $state(false);
  let isHidden = $state(false);
  let isQuickSearchOpen = $state(false);
  let showDomainNotice = $state(true);

  let lastScrollY = 0;

  const ALTERNATE_DOMAINS = [
    "skq.qzz.io",
    "comsic.qzz.io",
    "movie.sumit.info.np",
  ];

  onMount(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const latest = window.scrollY;
          const scrolledDown = latest > lastScrollY && latest > 50;
          const isAtTop = latest < 50;

          isScrolled = !isAtTop;

          if (scrolledDown && !isMobileMenuOpen) {
            isHidden = true;
          } else {
            isHidden = false;
          }
          lastScrollY = latest;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isQuickSearchOpen = !isQuickSearchOpen;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  $effect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    }
  });

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movie", label: "Movies", icon: Film },
    { href: "/series", label: "Series", icon: Tv },
  ];

  let pathname = $derived($page.url.pathname);
</script>

<header
  class="fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ease-out flex flex-col {isHidden ? '-translate-y-full' : 'translate-y-0'} {isScrolled || isMobileMenuOpen ? 'bg-background/80 backdrop-blur-md border-border' : 'bg-background/95 backdrop-blur-md border-transparent'}"
>
  <!-- LITE MODE BANNER -->
  <LiteModeBanner />

  <!-- Main Navigation Row -->
  <div class="w-full h-16 md:h-20 flex items-stretch relative z-20">
    <!-- Branding -->
    <div class="flex items-center px-6 md:px-10 border-r border-border bg-gradient-to-r from-foreground/5 to-transparent">
      <Logo />
    </div>

    <!-- Center Navigation Links -->
    <div class="hidden xl:flex flex-1 items-center justify-center">
      <nav class="flex items-center gap-10">
        {#each navLinks as link}
          {@const isActive = pathname === link.href}
          <a href={link.href} class="group relative py-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 {isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}">
                {link.label}
              </span>
            </div>
            <!-- Underline indicator -->
            <span class="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ease-out {isActive ? 'w-full' : 'w-0 group-hover:w-full'}" />
          </a>
        {/each}
      </nav>
    </div>

    <div class="xl:hidden flex-1" />

    <!-- Actions -->
    <div class="flex items-center">
      <!-- Search -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        onclick={() => (isQuickSearchOpen = true)}
        class="hidden md:flex items-center h-full px-6 border-l border-border hover:bg-accent transition-colors cursor-pointer"
      >
        <button class="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <Search size={18} />
          <span class="text-xs font-bold uppercase tracking-wider hidden lg:block">
            Search
          </span>
          <span class="text-[10px] font-mono border border-border px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
            ⌘K
          </span>
        </button>
      </div>

      <!-- Mobile Search Icon -->
      <button
        onclick={() => (isQuickSearchOpen = true)}
        class="md:hidden flex items-center justify-center h-full w-14 border-l border-border text-foreground hover:bg-accent cursor-pointer"
      >
        <Search size={20} />
      </button>

      <!-- Favourites -->
      <div class="flex items-center justify-center h-full w-14 md:w-16 border-l border-border hover:bg-accent transition-colors">
        <a href="/favourites" class="text-foreground">
          <Heart
            size={18}
            class="transition-transform duration-300 {pathname === '/favourites' ? 'fill-foreground' : 'hover:scale-110'}"
          />
        </a>
      </div>

      <!-- Settings -->
      <div class="flex items-center justify-center h-full w-14 md:w-16 border-l border-border hover:bg-accent transition-colors">
        <a href="/settings" class="text-foreground">
          <Settings
            size={18}
            class="transition-all duration-300 {pathname === '/settings' ? 'rotate-90 text-primary' : 'hover:rotate-45'}"
          />
        </a>
      </div>

      <!-- Mobile Hamburger Toggle -->
      <div class="xl:hidden flex items-center justify-center h-full w-16 border-l border-border">
        <button
          onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
          class="text-foreground hover:rotate-90 transition-transform duration-300 cursor-pointer"
        >
          {#if isMobileMenuOpen}
            <X size={24} />
          {:else}
            <Menu size={24} />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Alternate Mirror domains Notice -->
  {#if showDomainNotice}
    <div class="w-full bg-foreground/[0.03] backdrop-blur-md border-t border-border overflow-hidden relative z-10 transition-all duration-300 opacity-100">
      <div class="w-full px-4 h-8 flex items-center justify-between gap-4 text-[10px] tracking-wider font-mono text-muted-foreground">
        <div class="flex-1 min-w-0 flex items-center gap-3 overflow-x-auto snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div class="flex items-center gap-1.5 shrink-0 text-foreground/40">
            <AlertCircle size={12} />
            <span class="hidden sm:block">MIRRORS:</span>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            {#each ALTERNATE_DOMAINS as domain}
              <a
                href="https://{domain}"
                target="_blank"
                rel="noopener noreferrer"
                class="snap-start shrink-0 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {domain}
              </a>
            {/each}
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 pl-3 border-l border-border bg-gradient-to-l from-transparent to-transparent">
          <a
            href="/legal/domains"
            class="text-foreground hover:underline uppercase font-bold tracking-normal"
          >
            <span class="hidden sm:inline">All Mirrors</span>
            <span class="sm:hidden">More</span>
          </a>
          <button
            onclick={() => (showDomainNotice = false)}
            class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Mobile Menu overlay sliding menu -->
  {#if isMobileMenuOpen}
    <div class="absolute top-full left-0 right-0 h-[100dvh] bg-background/95 backdrop-blur-xl border-t border-border transition-opacity duration-300">
      <div class="flex flex-col h-full overflow-y-auto p-8 pb-[25vh]">
        <nav class="flex flex-col space-y-6">
          {#each navLinks as item, i}
            {@const isActive = pathname === item.href}
            <div class="animate-in fade-in slide-in-from-left-4 duration-300">
              <a
                href={item.href}
                onclick={() => (isMobileMenuOpen = false)}
                class="group flex items-center justify-between"
              >
                <span class="text-4xl font-black uppercase tracking-tighter transition-colors {isActive ? 'text-foreground' : 'text-transparent bg-clip-text bg-gradient-to-br from-muted-foreground to-foreground/50 group-hover:text-foreground'}">
                  {item.label}
                </span>
                <ArrowRight
                  size={24}
                  class="text-foreground opacity-0 group-hover:opacity-100 -rotate-45 group-hover:rotate-0 transition-all"
                />
              </a>
            </div>
          {/each}
        </nav>

        <div class="mt-auto border-t border-border pt-6">
          <p class="text-[10px] text-muted-foreground font-mono uppercase">
            © 2025 Crescent Moon.
          </p>
        </div>
      </div>
    </div>
  {/if}
</header>

<QuickSearch bind:open={isQuickSearchOpen} />

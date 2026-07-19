<script>
  import { settingsStore } from "$lib/stores";
  import { SITE_THEMES } from "$lib/themes";

  let currentTheme = $derived(SITE_THEMES[$settingsStore.siteTheme] || SITE_THEMES.midnight);
  let isLight = $derived(currentTheme.type === "light");
</script>

<a
  href="/"
  class="group flex items-center gap-2 select-none"
  aria-label="Crescent Moon Home"
>
  <div class="relative flex items-end justify-center w-8 h-8 md:w-10 md:h-10 mt-2 rounded-full bg-transparent text-foreground transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
    <img
      src={isLight ? "/logo-dark.svg" : "/logo.svg"}
      alt="Crescent Moon Logo"
      width="70"
      height="70"
      class="priority"
    />
    <div class="absolute inset-0 bg-primary blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
  </div>

  <div class="flex flex-col justify-center leading-none font-display">
    <span class="text-lg md:text-2xl font-bold tracking-tighter text-foreground uppercase group-hover:tracking-normal transition-all duration-500">
      Crescent
    </span>
    <span class="text-[10px] md:text-xs font-light tracking-[0.2em] text-muted-foreground uppercase group-hover:text-foreground transition-colors duration-300">
      Moon
    </span>
  </div>
</a>

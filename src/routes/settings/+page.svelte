<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { Palette, Server, MousePointer2, AlertTriangle, Trash2, RotateCcw, Check, Monitor, Tv, MessageSquare, Sun } from "lucide-svelte";
  import { settingsStore, resetSettings, showSnowStore, liteModeStore } from "$lib/stores";
  import { SITE_THEMES } from "$lib/themes";

  let { data } = $props();
  let movieServers = $derived(data.movieServers || []);
  let tvServers = $derived(data.tvServers || []);

  let showSavedToast = $state(false);

  function triggerToast() {
    showSavedToast = true;
    setTimeout(() => (showSavedToast = false), 3000);
  }

  function handleReset() {
    resetSettings();
    showSnowStore.set(false);
    liteModeStore.set(false);
    triggerToast();
  }

  function updateSetting(key, val) {
    settingsStore.update((s) => ({ ...s, [key]: val }));
    triggerToast();
  }
</script>

<div class="max-w-3xl mx-auto mt-16 px-4 md:px-8 py-16 pt-24 selection:bg-primary/30">
  <header class="mb-16">
    <h1 class="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-4">
      Settings
    </h1>
    <p class="text-muted-foreground text-lg max-w-xl font-medium">
      Personalize your viewing experience. These settings are saved locally to your browser.
    </p>
  </header>

  <!-- THEMING SECTION -->
  <section class="mb-12">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
        <Palette size={20} />
      </div>
      <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">Theming</h2>
        <p class="text-sm text-muted-foreground font-medium">Customize the visual appearance of Cmoon.</p>
      </div>
    </div>

    <!-- Theme cards -->
    <div class="p-6 bg-card border border-border rounded-2xl mb-4">
      <h3 class="text-sm font-bold text-foreground mb-4 uppercase tracking-wider font-mono">Site Theme</h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {#each Object.keys(SITE_THEMES) as themeKey}
          {@const theme = SITE_THEMES[themeKey]}
          {@const isActive = $settingsStore.siteTheme === themeKey}
          <button
            onclick={() => updateSetting("siteTheme", themeKey)}
            class="group relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer {isActive ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-muted/50 hover:border-primary/50'}"
          >
            <div class="w-full aspect-video rounded-lg border border-border overflow-hidden flex" style="background: hsl({theme.colors.background});">
              <div class="w-1/3 h-full" style="background: hsl({theme.colors.primary});" />
              <div class="w-1/3 h-full" style="background: hsl({theme.colors.secondary});" />
              <div class="w-1/3 h-full" style="background: hsl({theme.colors.accent});" />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-tight {isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}">
              {theme.name}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Snow and Lite mode toggles -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Snow -->
      <button
        onclick={() => { $showSnowStore = !$showSnowStore; triggerToast(); }}
        class="flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all cursor-pointer text-left"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center {$showSnowStore ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}">
            <Sun size={18} />
          </div>
          <div>
            <h3 class="text-sm font-bold text-foreground">Snow Fall Particles</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Toggle falling snow overlay effect.</p>
          </div>
        </div>
        <div class="w-12 h-6 rounded-full relative transition-colors duration-300 {$showSnowStore ? 'bg-primary' : 'bg-muted'}">
          <div class="absolute top-1 left-0 w-4 h-4 bg-background rounded-full shadow-lg transition-transform duration-300" style="transform: translateX({$showSnowStore ? '26px' : '2px'});" />
        </div>
      </button>

      <!-- Custom cursor toggle -->
      <button
        onclick={() => updateSetting("customCursor", !$settingsStore.customCursor)}
        class="flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all cursor-pointer text-left"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center {$settingsStore.customCursor ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}">
            <MousePointer2 size={18} />
          </div>
          <div>
            <h3 class="text-sm font-bold text-foreground">Custom Cursor</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Enable smooth custom cursor wrapper.</p>
          </div>
        </div>
        <div class="w-12 h-6 rounded-full relative transition-colors duration-300 {$settingsStore.customCursor ? 'bg-primary' : 'bg-muted'}">
          <div class="absolute top-1 left-0 w-4 h-4 bg-background rounded-full shadow-lg transition-transform duration-300" style="transform: translateX({$settingsStore.customCursor ? '26px' : '2px'});" />
        </div>
      </button>
    </div>
  </section>

  <!-- SERVERS SECTION -->
  <section class="mb-12">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
        <Server size={20} />
      </div>
      <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">Servers</h2>
        <p class="text-sm text-muted-foreground font-medium">Choose your preferred streaming sources.</p>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <!-- Default Movie -->
      <div class="p-5 bg-card border border-border rounded-2xl">
        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-muted-foreground flex items-center gap-2">
          <Monitor size={16} /> Default Movie Server
        </h3>
        <select
          value={$settingsStore.defaultMovieServer}
          onchange={(e) => updateSetting("defaultMovieServer", e.target.value)}
          class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none cursor-pointer appearance-none"
        >
          {#each movieServers as s}
            <option value={s.name}>{s.name}</option>
          {/each}
        </select>
      </div>

      <!-- Default TV -->
      <div class="p-5 bg-card border border-border rounded-2xl">
        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-muted-foreground flex items-center gap-2">
          <Tv size={16} /> Default TV Server
        </h3>
        <select
          value={$settingsStore.defaultTvServer}
          onchange={(e) => updateSetting("defaultTvServer", e.target.value)}
          class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none cursor-pointer appearance-none"
        >
          {#each tvServers as s}
            <option value={s.name}>{s.name}</option>
          {/each}
        </select>
      </div>
    </div>
  </section>

  <!-- BEHAVIORS SECTION -->
  <section class="mb-12">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
        <Monitor size={20} />
      </div>
      <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">Interface & Player</h2>
        <p class="text-sm text-muted-foreground font-medium">Behavioral settings for the platform.</p>
      </div>
    </div>

    <!-- Toggles -->
    <div class="space-y-4">
      <button
        onclick={() => updateSetting("confirmRemove", !$settingsStore.confirmRemove)}
        class="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/30 text-left cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center {$settingsStore.confirmRemove ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}">
            <Trash2 size={18} />
          </div>
          <div>
            <h3 class="text-sm font-bold text-foreground">Remove Confirmation</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Confirm before deleting watched items.</p>
          </div>
        </div>
        <div class="w-12 h-6 rounded-full relative transition-colors duration-300 {$settingsStore.confirmRemove ? 'bg-primary' : 'bg-muted'}">
          <div class="absolute top-1 left-0 w-4 h-4 bg-background rounded-full shadow-lg transition-transform duration-300" style="transform: translateX({$settingsStore.confirmRemove ? '26px' : '2px'});" />
        </div>
      </button>

      <button
        onclick={() => updateSetting("showAdNotice", !$settingsStore.showAdNotice)}
        class="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/30 text-left cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center {$settingsStore.showAdNotice ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 class="text-sm font-bold text-foreground">Show Adblock Notice</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Reminder popup advising uBlock Origin installation.</p>
          </div>
        </div>
        <div class="w-12 h-6 rounded-full relative transition-colors duration-300 {$settingsStore.showAdNotice ? 'bg-primary' : 'bg-muted'}">
          <div class="absolute top-1 left-0 w-4 h-4 bg-background rounded-full shadow-lg transition-transform duration-300" style="transform: translateX({$settingsStore.showAdNotice ? '26px' : '2px'});" />
        </div>
      </button>
    </div>
  </section>

  <!-- Danger Zone -->
  <div class="mt-20 pt-10 border-t border-border">
    <button
      onclick={handleReset}
      class="flex items-center gap-2 px-6 py-3 rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border hover:border-destructive/20 transition-all text-sm font-bold cursor-pointer"
    >
      <RotateCcw size={16} /> Reset all settings to default
    </button>
  </div>
</div>

<!-- Saved Toast -->
{#if showSavedToast}
  <div transition:fly={{ y: 20 }} class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm">
    <Check size={18} /> Settings saved automatically
  </div>
{/if}

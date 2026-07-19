<script>
  import { onMount, tick } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { Play, Star, Clock, Calendar, Server, Heart, Share2, Film, List, Clapperboard, Zap, Languages, Check, Webhook, ShieldAlert, X, Crown, Settings2, Download, Tv, Database, Globe, Layers, HardDrive, Video, Link, Cpu, Shield, Monitor } from "lucide-svelte";
  import { settingsStore, favoritesStore, updateMediaProgress, isFavorite, addFavorite, removeFavorite } from "$lib/stores";

  let { data } = $props();
  let movie = $derived(data.movie || {});
  let genreArr = $derived(data.genreArr || []);
  let id = $derived(data.id);
  let videoSources = $derived(data.videoSources || []);

  let isMounted = $state(false);
  let selectedServer = $state(null);
  let iframeSrc = $state("");
  let isFav = $derived(isFavorite(movie.id, $favoritesStore));
  let toast = $state(null);
  let activeTab = $state("overview");
  let showAdPopup = $state(false);
  let showDownloadPopup = $state(false);

  let cast = $derived(movie.credits?.cast?.slice(0, 10) || []);
  let recommendations = $derived(movie.recommendations?.results?.slice(0, 12) || []);
  let reviews = $derived(movie.reviews?.results?.slice(0, 5) || []);

  let lastSavedTime = 0;

  onMount(() => {
    isMounted = true;
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true" && $settingsStore.showAdNotice) {
      showAdPopup = true;
    }

    const savedSession = sessionStorage.getItem("sessionServerName");
    const savedDefault = $settingsStore.defaultMovieServer;

    const initialServerName = savedSession || savedDefault || (videoSources[0] && videoSources[0].name);
    selectedServer = videoSources.find((s) => s.name === initialServerName) || videoSources[0];

    // Setup initial watch progress in localstorage
    updateMediaProgress(id, {
      type: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      progress: { watched: 0, duration: movie.runtime * 60 || 1 }
    });

    const handleMessage = (event) => {
      try {
        let payload = event.data;
        if (typeof payload === "string") payload = JSON.parse(payload);

        const isTimeUpdate = payload.event === "timeupdate" || payload.type === "timeupdate";
        if (isTimeUpdate || payload.currentTime !== undefined) {
          const currentTime = payload.currentTime ?? payload.time ?? 0;
          const duration = payload.duration ?? movie.runtime * 60 ?? 1;

          if (currentTime > 0 && Math.abs(currentTime - lastSavedTime) >= 5) {
            updateMediaProgress(id, {
              progress: {
                watched: Number(currentTime),
                duration: Number(duration)
              }
            });
            lastSavedTime = currentTime;
          }
        }
      } catch (err) {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

  $effect(() => {
    if (!isMounted || !selectedServer) return;
    const { url, params, paramStyle } = selectedServer;
    let finalUrl = "";
    if (paramStyle === "path-slash" || paramStyle === "path-hyphen-mapi") {
      finalUrl = `${url}${id}`;
    } else {
      finalUrl = `${url}${id}${params || ""}`;
    }
    iframeSrc = finalUrl;
  });

  function handleServerChange(server) {
    selectedServer = server;
    sessionStorage.setItem("sessionServerName", server.name);
  }

  function handleSetDefault(serverName) {
    settingsStore.update(s => ({ ...s, defaultMovieServer: serverName }));
    triggerToast(`Set ${serverName} as default movie source`);
  }

  function handleFavoriteToggle() {
    if (isFav) {
      removeFavorite(movie.id);
      triggerToast("Removed from Library");
    } else {
      addFavorite(movie);
      triggerToast("Added to Library");
    }
  }

  function triggerToast(msg) {
    toast = msg;
    setTimeout(() => (toast = null), 3000);
  }

  function share() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Link copied to clipboard");
    }
  }

  function dismissAd() {
    sessionStorage.setItem("adblockerNoticeDismissed", "true");
    showAdPopup = false;
  }

  let bgImage = $derived(movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : `https://image.tmdb.org/t/p/original${movie.poster_path}`);
</script>

<div class="min-h-screen mt-16 lg:h-screen w-full bg-background text-foreground font-sans flex flex-col pt-18 lg:pt-0 overflow-x-hidden selection:bg-primary/30">
  <!-- Background wallpaper -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
    <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:w-1/2" />
    <img
      src={bgImage}
      class="w-full h-full object-cover blur-[100px] opacity-10 scale-110"
      alt="Background"
    />
  </div>

  <div class="relative z-10 flex-1 pt-16 flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:overflow-hidden lg:h-screen">
    <!-- Metadata Sidebar panel -->
    <div class="order-2 lg:order-1 lg:col-span-4 bg-background/40 backdrop-blur-2xl flex flex-col lg:overflow-y-auto custom-scrollbar h-auto lg:h-full lg:border-r border-border pb-12 lg:pb-0 shadow-2xl">
      <div class="p-6 md:p-8 shrink-0">
        <div class="flex flex-wrap gap-2 mb-4">
          {#each genreArr.slice(0, 3) as g}
            <span class="px-3 py-1 rounded-lg bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
              {g.name || g}
            </span>
          {/each}
        </div>

        <h1 class="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1] text-foreground mb-6">
          {movie.title}
        </h1>

        <div class="grid grid-cols-3 gap-3 mb-8">
          <div class="flex flex-col bg-foreground/5 border border-border px-4 py-2.5 rounded-2xl backdrop-blur-md">
            <div class="flex items-center gap-1.5 mb-1 text-primary">
              <Star size={14} />
              <span class="text-[10px] uppercase tracking-widest font-bold opacity-90">Rating</span>
            </div>
            <span class="text-sm font-black text-foreground">{movie.vote_average?.toFixed(1) || "N/A"}</span>
          </div>

          <div class="flex flex-col bg-foreground/5 border border-border px-4 py-2.5 rounded-2xl backdrop-blur-md">
            <div class="flex items-center gap-1.5 mb-1 text-primary">
              <Clock size={14} />
              <span class="text-[10px] uppercase tracking-widest font-bold opacity-90">Runtime</span>
            </div>
            <span class="text-sm font-black text-foreground">{movie.runtime}m</span>
          </div>

          <div class="flex flex-col bg-foreground/5 border border-border px-4 py-2.5 rounded-2xl backdrop-blur-md">
            <div class="flex items-center gap-1.5 mb-1 text-secondary-foreground">
              <Calendar size={14} />
              <span class="text-[10px] uppercase tracking-widest font-bold opacity-90">Year</span>
            </div>
            <span class="text-sm font-black text-foreground">{movie.release_date?.split("-")[0]}</span>
          </div>
        </div>

        <!-- Buttons Panel -->
        <div class="grid grid-cols-3 gap-3 mb-8">
          <button
            onclick={handleFavoriteToggle}
            class="h-12 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase tracking-wider transition-all shadow-lg cursor-pointer {isFav ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'}"
          >
            <Heart size={14} class={isFav ? "fill-current" : ""} />
            {isFav ? "Saved" : "Save"}
          </button>
          <button
            onclick={share}
            class="h-12 rounded-xl bg-muted border border-border flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-muted/80 transition-all text-foreground cursor-pointer"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onclick={() => (showDownloadPopup = true)}
            class="h-12 rounded-xl border border-primary flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase tracking-wider transition-all text-foreground hover:bg-primary/5 shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Download size={14} /> Download
          </button>
        </div>

        <!-- Active Server Detail -->
        <div class="bg-card rounded-2xl border border-border shadow-xl overflow-hidden mb-8 flex flex-col">
          {#if selectedServer}
            <div class="p-5 border-b border-border bg-foreground/[0.02] relative overflow-hidden">
              <div class="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
              <div class="flex items-start justify-between relative z-10 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Server size={18} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">
                        {selectedServer.name}
                      </h3>
                      {#if selectedServer.name === $settingsStore.defaultMovieServer}
                        <span class="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                          <Star size={8} class="fill-current" /> Default
                        </span>
                      {/if}
                    </div>
                    <p class="text-[11px] text-muted-foreground mt-1">
                      {selectedServer.description || "Active streaming server endpoint."}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between relative z-10">
                <div class="flex gap-1.5 flex-wrap">
                  {#each (selectedServer.features || []) as f}
                    <span class="px-2.5 py-1 bg-muted text-muted-foreground border border-border rounded-md text-[9px] uppercase font-bold tracking-wider">
                      {f}
                    </span>
                  {/each}
                </div>
                {#if selectedServer.name !== $settingsStore.defaultMovieServer}
                  <button
                    onclick={() => handleSetDefault(selectedServer.name)}
                    class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg ml-auto border border-primary/20 cursor-pointer"
                  >
                    <Star size={12} /> Set Default
                  </button>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Server switcher grid -->
          <div class="p-5 bg-background/50">
            <div class="flex items-center justify-between mb-4 font-mono">
              <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Server size={12} /> Change Source
              </span>
              <span class="text-[10px] font-bold text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full border border-border">
                {videoSources.length} Options
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              {#each videoSources as s}
                {@const active = selectedServer?.name === s.name}
                {@const isDefault = s.name === $settingsStore.defaultMovieServer}
                <button
                  onclick={() => handleServerChange(s)}
                  class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group cursor-pointer {active ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border hover:bg-foreground/5'}"
                >
                  <span class="text-[11px] font-semibold truncate {active ? 'text-foreground font-bold' : 'text-muted-foreground'}">
                    {s.name}
                  </span>
                  {#if isDefault}
                    <Star size={10} class="text-amber-500 fill-amber-500" />
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Sidebar detail Tabs selectors -->
        <div class="flex gap-1 p-1 bg-muted rounded-2xl w-fit mb-6">
          {#each ["overview", "cast", "reviews", "related"] as tab}
            <button
              onclick={() => (activeTab = tab)}
              class="relative px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer {activeTab === tab ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}"
            >
              {tab}
            </button>
          {/each}
        </div>

        <!-- Tab contents -->
        <div class="min-h-[300px]">
          {#if activeTab === "overview"}
            <div transition:fade={{ duration: 150 }}>
              <p class="text-sm leading-relaxed text-muted-foreground font-medium mb-6">
                {movie.overview}
              </p>
              <div class="p-4 rounded-xl bg-foreground/5 border border-border flex flex-col gap-1">
                <span class="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Original Title</span>
                <span class="text-sm font-bold text-foreground">{movie.original_title}</span>
              </div>
            </div>
          {:else}
            {#if activeTab === "cast"}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" transition:fade={{ duration: 150 }}>
                {#each cast as c}
                  <div class="flex items-center gap-3 p-3 rounded-2xl bg-foreground/[0.02] border border-border">
                    <img
                      src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "https://via.placeholder.com/50"}
                      class="w-12 h-12 rounded-full object-cover shrink-0 bg-muted"
                      alt={c.name}
                    />
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-bold text-foreground truncate">{c.name}</div>
                      <div class="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{c.character}</div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            {#if activeTab === "reviews"}
              <div class="space-y-4" transition:fade={{ duration: 150 }}>
                {#each reviews as r}
                  <div class="p-5 rounded-2xl bg-muted border border-border text-sm relative">
                    <div class="font-bold text-foreground mb-3 flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs shadow-md">
                        {r.author[0].toUpperCase()}
                      </div>
                      {r.author}
                    </div>
                    <p class="text-muted-foreground leading-relaxed text-xs">"{r.content.slice(0, 250)}..."</p>
                  </div>
                {:else}
                  <div class="text-muted-foreground text-sm flex items-center justify-center h-32 bg-muted rounded-2xl border border-border">
                    No reviews available yet.
                  </div>
                {/each}
              </div>
            {/if}

            {#if activeTab === "related"}
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4" transition:fade={{ duration: 150 }}>
                {#each recommendations as m}
                  <a href="/movie/{m.id}" class="aspect-[2/3] relative group cursor-pointer overflow-hidden rounded-xl border border-border block bg-muted shadow-lg">
                    <img
                      src="https://image.tmdb.org/t/p/w300{m.poster_path || m.backdrop_path}"
                      class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      alt={m.title}
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 group-hover:opacity-100" />
                    <div class="absolute bottom-3 left-3 right-3">
                      <div class="text-xs font-bold text-foreground line-clamp-2 leading-tight">{m.title}</div>
                    </div>
                  </a>
                {:else}
                  <div class="col-span-full text-muted-foreground text-sm flex items-center justify-center h-32 bg-muted rounded-2xl border border-border">
                    No related movies found.
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>

    <!-- Live Player Panel (Right) -->
    <div class="order-1 lg:order-2 lg:col-span-8 flex flex-col items-center justify-center relative p-0 lg:p-8 min-h-[35vh] sm:min-h-[50vh] lg:h-full bg-background">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 opacity-60 pointer-events-none" />
      <div class="w-full h-full lg:max-h-[85%] aspect-video relative lg:rounded-2xl overflow-hidden lg:shadow-2xl lg:border border-border z-10 bg-black">
        {#if iframeSrc}
          <iframe
            src={iframeSrc}
            class="w-full h-full absolute inset-0 z-10 bg-black border-0"
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            referrerpolicy="no-referrer"
            title="Player"
          />
        {:else}
          <div class="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-4 absolute inset-0 z-0">
            <div class="w-10 h-10 border-2 border-border border-t-primary animate-spin rounded-full"></div>
            Initializing Player...
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Overlays -->
{#if toast}
  <div transition:fly={{ y: 20 }} class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border text-foreground px-5 py-3.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3 min-w-[250px] justify-center">
    <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
      <Check size={12} />
    </div>
    {toast}
  </div>
{/if}

{#if showAdPopup}
  <div transition:fly={{ y: 20 }} class="fixed bottom-6 right-6 z-[100] w-[340px] bg-card border border-border p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
    <div class="flex gap-4 items-start">
      <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
        <ShieldAlert class="text-amber-500" size={18} />
      </div>
      <div class="flex-1 pt-0.5">
        <h4 class="font-bold text-foreground text-sm mb-1">Adblock Recommended</h4>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Third-party sources may contain popups. We strongly advise using <span class="text-primary font-bold">uBlock Origin</span>.
        </p>
      </div>
      <button onclick={dismissAd} class="text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full p-1.5 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  </div>
{/if}

{#if showDownloadPopup}
  <div transition:fade class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div transition:scale class="relative w-full max-w-4xl h-[80vh] bg-background border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border bg-foreground/[0.02]">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Download size={16} />
          </div>
          <div>
            <h3 class="font-bold text-sm text-foreground uppercase tracking-wider">Download Options</h3>
            <p class="text-[10px] text-muted-foreground">Access download links via VidVault</p>
          </div>
        </div>
        <button onclick={() => (showDownloadPopup = false)} class="text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full p-2 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div class="flex-1 bg-background relative">
        <iframe
          src="https://vidvault.ru/movie/{id}"
          class="w-full h-full absolute inset-0 z-10 border-0"
          allowfullscreen
          title="Download Portal"
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>

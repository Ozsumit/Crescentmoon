<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { Star, Heart, Calendar, Clock, Play, Users, Globe, Tag, ArrowLeft, Server } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { settingsStore, favoritesStore, isFavorite, addFavorite, removeFavorite } from "$lib/stores";

  let { data } = $props();
  let anime = $derived(data.anime || {});
  let characters = $derived(data.characters || []);
  let id = $derived(data.id);
  let videoSources = $derived(data.videoSources || []);

  let isMounted = $state(false);
  let activeTab = $state("overview");
  let selectedServer = $state(null);
  let activeEpisodeNum = $state(1);
  let iframeSrc = $state("");
  let toast = $state(null);

  onMount(() => {
    isMounted = true;
    const savedSession = sessionStorage.getItem("sessionTvServerName");
    const savedDefault = $settingsStore.defaultTvServer;
    const initialServerName = savedSession || savedDefault || (videoSources[0] && videoSources[0].name);

    selectedServer = videoSources.find((s) => s.name === initialServerName) || videoSources[0];
  });

  $effect(() => {
    if (!isMounted || !selectedServer) return;
    const { url, params, paramStyle } = selectedServer;
    // Map Mal ID / MyAnimeList using appropriate TV routing mapping
    let finalUrl = "";
    if (paramStyle === "path-slash") {
      finalUrl = `${url}${id}/1/${activeEpisodeNum}`;
    } else if (paramStyle === "path-hyphen-mapi") {
      finalUrl = `${url}${id}-1-${activeEpisodeNum}`;
    } else {
      finalUrl = `${url}${id}/1/${activeEpisodeNum}${params || ""}`;
    }
    iframeSrc = finalUrl;
  });

  function handleServerChange(server) {
    selectedServer = server;
    sessionStorage.setItem("sessionTvServerName", server.name);
  }

  function handleEpisodeChange(epNum) {
    activeEpisodeNum = epNum;
  }

  function triggerToast(msg) {
    toast = msg;
    setTimeout(() => (toast = null), 3000);
  }
</script>

{#if !anime}
  <div class="min-h-screen bg-background flex items-center justify-center pt-24">
    <div class="text-center">
      <p class="text-xl text-destructive font-mono uppercase tracking-widest">Anime Not Found</p>
      <a href="/anime" class="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider">
        Back to Anime Catalog
      </a>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-background pb-12 pt-16">
    <!-- Hero backdrop banner -->
    <div
      class="relative h-[60vh] bg-cover bg-center"
      style:background-image="url({anime.images?.jpg?.large_image_url})"
    >
      <div class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50">
        <div class="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <a
            href="/anime"
            class="absolute top-4 left-4 text-white flex items-center space-x-2 hover:text-primary transition-colors group"
          >
            <ArrowLeft size={20} />
            <span class="font-bold text-xs uppercase tracking-widest">Back</span>
          </a>

          <div class="flex flex-col md:flex-row items-end md:items-center gap-6 pt-12">
            <div class="w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl hidden md:block">
              <img
                src={anime.images?.jpg?.large_image_url}
                alt={anime.title}
                class="w-full h-auto"
              />
            </div>

            <div class="flex-1">
              <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {anime.title}
              </h1>
              <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div class="flex items-center">
                  <Star class="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                  <span>{anime.score || "N/A"}</span>
                </div>
                <div class="flex items-center">
                  <Calendar class="w-4 h-4 mr-1" />
                  <span>{anime.aired?.string || "N/A"}</span>
                </div>
                <div class="flex items-center">
                  <Clock class="w-4 h-4 mr-1" />
                  <span>{anime.duration}</span>
                </div>
                <div class="flex items-center">
                  <Play class="w-4 h-4 mr-1" />
                  <span>{anime.episodes || "Unknown"} Episodes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Player / Episode Selector Panel Row -->
    <div class="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
      <!-- Player -->
      <div class="lg:col-span-8 flex flex-col justify-center items-center relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-border aspect-video">
        {#if iframeSrc}
          <iframe
            src={iframeSrc}
            class="w-full h-full absolute inset-0 z-10 bg-black border-0"
            allowfullscreen
            title="Player"
          />
        {:else}
          <div class="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-4">
            <div class="w-10 h-10 border-2 border-border border-t-primary animate-spin rounded-full"></div>
            Loading Anime Stream...
          </div>
        {/if}
      </div>

      <!-- Episodes list -->
      <div class="lg:col-span-4 bg-card border border-border p-6 rounded-3xl flex flex-col max-h-[500px]">
        <h3 class="text-lg font-bold mb-4 flex justify-between items-center font-mono">
          <span>Episodes</span>
          <span class="text-xs text-muted-foreground font-mono bg-muted border border-border px-2 py-0.5 rounded">
            {anime.episodes || 12} Episodes
          </span>
        </h3>

        <!-- Episodes grid -->
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-4 gap-2">
          {#each Array.from({ length: anime.episodes || 12 }) as _, i}
            {@const epNum = i + 1}
            {@const active = epNum === activeEpisodeNum}
            <button
              onclick={() => handleEpisodeChange(epNum)}
              class="aspect-square rounded-xl border flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 cursor-pointer {active ? 'bg-primary border-primary text-primary-foreground font-black' : 'bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground'}"
            >
              {epNum}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Content Card Section -->
    <div class="container mx-auto px-4">
      <div class="bg-card/50 backdrop-blur-xl rounded-xl p-6 border border-border">
        <!-- Tabs selectors -->
        <div class="flex space-x-4 mb-6 border-b border-border overflow-x-auto">
          {#each ["overview", "characters"] as tab}
            <button
              onclick={() => (activeTab = tab)}
              class="pb-3 px-4 text-sm font-medium capitalize transition-colors whitespace-nowrap cursor-pointer {activeTab === tab ? 'text-primary border-b-2 border-primary font-bold' : 'text-muted-foreground hover:text-foreground'}"
            >
              {tab}
            </button>
          {/each}
        </div>

        <!-- Tab Contents -->
        {#if activeTab === "overview"}
          <div class="space-y-6" transition:fade={{ duration: 150 }}>
            <div>
              <h3 class="text-xl font-semibold text-foreground mb-4">Synopsis</h3>
              <p class="text-muted-foreground leading-relaxed font-light">{anime.synopsis || "No synopsis available."}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-xl font-semibold text-foreground mb-4">Information</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex items-center gap-2">
                    <Tag class="w-4 h-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Type:</span>
                    <span class="text-foreground font-bold">{anime.type}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Globe class="w-4 h-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Status:</span>
                    <span class="text-foreground font-bold">{anime.status}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Users class="w-4 h-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Rating:</span>
                    <span class="text-foreground font-bold">{anime.rating}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-foreground mb-4">Genres</h3>
                <div class="flex flex-wrap gap-2">
                  {#each (anime.genres || []) as genre}
                    <span class="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs border border-primary/20">{genre.name}</span>
                  {/each}
                </div>
              </div>
            </div>

            <!-- Server selector -->
            <div class="p-6 rounded-[2rem] bg-muted border border-border">
              <span class="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 block flex items-center gap-2">
                <Server size={14} /> Server Endpoint
              </span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {#each videoSources as s}
                  {@const active = selectedServer?.name === s.name}
                  <button
                    onclick={() => handleServerChange(s)}
                    class="flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all duration-200 text-xs font-bold cursor-pointer truncate {active ? 'bg-primary/10 border-primary/30 text-foreground font-bold' : 'bg-card border-border hover:bg-foreground/5'}"
                  >
                    {s.name}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if activeTab === "characters"}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" transition:fade={{ duration: 150 }}>
            {#each characters as char}
              <div class="bg-card/50 border border-border/50 rounded-xl p-4 shadow-lg flex flex-col items-center text-center">
                <img
                  src={char.character.images?.jpg?.image_url}
                  alt={char.character.name}
                  class="w-24 h-24 rounded-full object-cover mb-3"
                />
                <h4 class="text-foreground font-bold text-sm mb-1">{char.character.name}</h4>
                <p class="text-muted-foreground text-xs">{char.role}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Toast -->
{#if toast}
  <div transition:fly={{ y: 20 }} class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border text-foreground px-5 py-3.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3 min-w-[250px] justify-center">
    <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
      <Check size={12} />
    </div>
    {toast}
  </div>
{/if}

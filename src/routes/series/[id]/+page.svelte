<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { Star, Heart, Share2, ArrowLeft, Play, Calendar, Server } from "lucide-svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { settingsStore, favoritesStore, updateMediaProgress, isFavorite, addFavorite, removeFavorite } from "$lib/stores";
  import HomeCard from "$lib/components/HomeCard.svelte";

  let { data } = $props();
  let series = $derived(data.series || {});
  let id = $derived(data.id);
  let seasons = $derived(data.seasons || []);
  let videoSources = $derived(data.videoSources || []);
  let episodes = $derived(data.episodes || []);
  let activeSeasonNum = $derived(data.activeSeasonNum || 1);

  let activeEpisodeNum = $state(1);
  let selectedServer = $state(null);
  let iframeSrc = $state("");
  let isMounted = $state(false);
  let isFav = $derived(isFavorite(series.id, $favoritesStore));
  let toast = $state(null);
  let activeTab = $state("seasons");

  let cast = $derived(series.credits?.cast?.slice(0, 10) || []);
  let recommendations = $derived(series.recommendations?.results?.slice(0, 12) || []);
  let reviews = $derived(series.reviews?.results?.slice(0, 5) || []);

  let lastSavedTime = 0;

  onMount(() => {
    isMounted = true;
    const urlParams = new URLSearchParams(window.location.search);
    const savedEp = Number(urlParams.get("episode")) || 1;
    activeEpisodeNum = savedEp;

    const savedSession = sessionStorage.getItem("sessionTvServerName");
    const savedDefault = $settingsStore.defaultTvServer;
    const initialServerName = savedSession || savedDefault || (videoSources[0] && videoSources[0].name);

    selectedServer = videoSources.find((s) => s.name === initialServerName) || videoSources[0];

    updateMediaProgress(id, {
      type: "tv",
      title: series.name,
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      vote_average: series.vote_average,
      overview: series.overview,
      last_season_watched: activeSeasonNum,
      last_episode_watched: activeEpisodeNum,
      progress: { watched: 0, duration: 45 * 60 }
    });

    const handleMessage = (event) => {
      try {
        let payload = event.data;
        if (typeof payload === "string") payload = JSON.parse(payload);
        const isTimeUpdate = payload.event === "timeupdate" || payload.type === "timeupdate";
        if (isTimeUpdate || payload.currentTime !== undefined) {
          const currentTime = payload.currentTime ?? payload.time ?? 0;
          const duration = payload.duration ?? 45 * 60;
          if (currentTime > 0 && Math.abs(currentTime - lastSavedTime) >= 5) {
            updateMediaProgress(id, {
              last_season_watched: activeSeasonNum,
              last_episode_watched: activeEpisodeNum,
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
    if (paramStyle === "path-slash") {
      finalUrl = `${url}${id}/${activeSeasonNum}/${activeEpisodeNum}`;
    } else if (paramStyle === "path-hyphen-mapi") {
      finalUrl = `${url}${id}-${activeSeasonNum}-${activeEpisodeNum}`;
    } else {
      finalUrl = `${url}${id}/${activeSeasonNum}/${activeEpisodeNum}${params || ""}`;
    }
    iframeSrc = finalUrl;
  });

  function handleServerChange(server) {
    selectedServer = server;
    sessionStorage.setItem("sessionTvServerName", server.name);
  }

  function handleSetDefault(serverName) {
    settingsStore.update(s => ({ ...s, defaultTvServer: serverName }));
    triggerToast(`Set ${serverName} as default TV source`);
  }

  function handleSeasonChange(seasonNum) {
    goto(`/series/${id}?season=${seasonNum}&episode=1`);
    activeEpisodeNum = 1;
  }

  function handleEpisodeChange(epNum) {
    activeEpisodeNum = epNum;
    goto(`/series/${id}?season=${activeSeasonNum}&episode=${epNum}`);
    // Save watch progress state
    updateMediaProgress(id, {
      last_season_watched: activeSeasonNum,
      last_episode_watched: epNum
    });
  }

  function handleFavoriteToggle() {
    if (isFav) {
      removeFavorite(series.id);
      triggerToast("Removed from Library");
    } else {
      addFavorite(series);
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

  let bgImage = $derived(series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : `https://image.tmdb.org/t/p/original${series.poster_path}`);
</script>

<div class="min-h-screen bg-background text-foreground pb-24 relative overflow-x-hidden selection:bg-primary/20">
  <!-- Wallpaper backdrop -->
  <div class="fixed inset-0 z-0 pointer-events-none">
    <div class="absolute inset-0 bg-gradient-to-b from-background/20 via-background/90 to-background z-10" />
    <img src={bgImage} class="w-full h-full object-cover blur-[80px] opacity-10" alt="Backdrop" />
  </div>

  <div class="relative z-10 max-w-[2000px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-12">
    <!-- Back to browse -->
    <div class="flex justify-between items-center mb-12 pt-16">
      <a href="/series" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
        <div class="p-2 rounded-full border border-border bg-card group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <ArrowLeft size={20} />
        </div>
        <span class="font-mono text-xs uppercase tracking-widest hidden sm:block">Back to Series</span>
      </a>
    </div>

    <!-- Active Player panel row -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
      <!-- Left side: Player -->
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
            Loading Player...
          </div>
        {/if}
      </div>

      <!-- Right side: Episode selection -->
      <div class="lg:col-span-4 bg-card/60 backdrop-blur-xl border border-border p-6 rounded-3xl flex flex-col max-h-[500px]">
        <h3 class="text-lg font-bold mb-4 flex justify-between items-center">
          <span>Episodes</span>
          <select
            value={activeSeasonNum}
            onchange={(e) => handleSeasonChange(e.target.value)}
            class="bg-muted text-foreground border border-border rounded-xl px-4 py-2 text-xs font-bold focus:outline-none cursor-pointer"
          >
            {#each (seasons || []) as s}
              <option value={s.season_number}>{s.name}</option>
            {/each}
          </select>
        </h3>

        <!-- Episodes scrollable list -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {#each (episodes || []) as ep}
            {@const active = ep.episode_number === activeEpisodeNum}
            <button
              onclick={() => handleEpisodeChange(ep.episode_number)}
              class="w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 {active ? 'bg-primary/10 border-primary/30 text-foreground font-bold' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'}"
            >
              <span class="font-mono text-xs text-primary">{String(ep.episode_number).padStart(2, "0")}</span>
              <div class="min-w-0 flex-1">
                <p class="text-xs truncate font-bold text-foreground">{ep.name}</p>
                <p class="text-[10px] line-clamp-1">{ep.overview || "No episode overview available."}</p>
              </div>
            </button>
          {:else}
            <div class="text-center text-muted-foreground text-xs py-10">No episodes found.</div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Details card surface -->
    <div class="bg-card border border-border rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
      <div class="relative z-10 grid lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr] gap-12 items-start">
        <!-- Sidebar stats -->
        <div class="space-y-8 sticky top-12">
          <div class="aspect-[2/3] rounded-[2rem] overflow-hidden border border-border shadow-2xl relative">
            <img src="https://image.tmdb.org/t/p/w500{series.poster_path}" alt={series.name} class="w-full h-full object-cover" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              onclick={handleFavoriteToggle}
              class="flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all duration-300 cursor-pointer {isFav ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-primary text-primary-foreground border-primary hover:opacity-90'}"
            >
              <Heart size={18} fill={isFav ? "currentColor" : "none"} />
              <span class="font-bold text-sm tracking-wide">{isFav ? "SAVED" : "LIBRARY"}</span>
            </button>

            <button
              onclick={share}
              class="flex items-center justify-center gap-2 py-4 rounded-2xl border border-border bg-muted text-foreground hover:bg-muted/80 transition-all cursor-pointer"
            >
              <Share2 size={18} />
              <span class="font-bold text-sm tracking-wide">SHARE</span>
            </button>
          </div>

          <!-- Quick statistics details -->
          <div class="space-y-4 p-6 rounded-[2rem] bg-muted border border-border">
            <div class="flex justify-between items-center pb-4 border-b border-border">
              <span class="text-muted-foreground font-mono text-xs uppercase">Rating</span>
              <div class="flex items-center gap-2">
                <Star class="text-foreground w-4 h-4 fill-amber-500" />
                <span class="text-foreground font-bold">{series.vote_average?.toFixed(1)}/10</span>
              </div>
            </div>
            <div class="flex justify-between items-center pb-4 border-b border-border">
              <span class="text-muted-foreground font-mono text-xs uppercase">Seasons</span>
              <span class="text-foreground font-bold">{series.number_of_seasons}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground font-mono text-xs uppercase">First Air</span>
              <span class="text-foreground font-bold">{series.first_air_date ? new Date(series.first_air_date).getFullYear() : "N/A"}</span>
            </div>
          </div>

          <!-- Change source server -->
          <div class="p-6 rounded-[2rem] bg-muted border border-border">
            <span class="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 block flex items-center gap-2">
              <Server size={14} /> Server Endpoint
            </span>
            <div class="grid grid-cols-2 gap-2">
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

        <!-- Main text content detail -->
        <div class="space-y-10">
          <div class="space-y-6">
            <div class="flex flex-wrap gap-2">
              {#each genreArr as g}
                <span class="px-3 py-1 rounded-full border border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {g.name || g}
                </span>
              {/each}
            </div>

            <h1 class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9]">
              {series.name}
            </h1>

            {#if series.tagline}
              <p class="text-xl text-muted-foreground font-light italic border-l-2 border-foreground/20 pl-4">
                "{series.tagline}"
              </p>
            {/if}

            <p class="text-lg text-muted-foreground leading-relaxed font-light max-w-3xl">
              {series.overview}
            </p>
          </div>

          <!-- Extra details tabs -->
          <div class="flex gap-1 p-1 bg-muted rounded-2xl w-fit">
            {#each ["cast", "reviews", "similar"] as tab}
              <button
                onclick={() => (activeTab = tab)}
                class="relative px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer {activeTab === tab ? 'text-primary bg-primary/10 font-bold' : 'text-muted-foreground hover:text-foreground'}"
              >
                <span class="capitalize">{tab}</span>
              </button>
            {/each}
          </div>

          <div class="min-h-[300px]">
            {#if activeTab === "cast"}
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" transition:fade={{ duration: 150 }}>
                {#each cast as c}
                  <div class="flex flex-col gap-3">
                    <div class="w-full aspect-[2/3] overflow-hidden rounded-2xl bg-muted border border-border relative">
                      <img
                        src={c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : "https://via.placeholder.com/200x300?text=No+Image"}
                        alt={c.name}
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-foreground leading-tight">{c.name}</p>
                      <p class="text-xs text-muted-foreground font-mono mt-1">{c.character}</p>
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

            {#if activeTab === "similar"}
              <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6" transition:fade={{ duration: 150 }}>
                {#each recommendations as show}
                  <HomeCard MovieCard={show} />
                {:else}
                  <div class="col-span-full text-muted-foreground text-sm flex items-center justify-center h-32 bg-muted rounded-2xl border border-border">
                    No similar TV series found.
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Toast -->
{#if toast}
  <div transition:fly={{ y: 20 }} class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border text-foreground px-5 py-3.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3 min-w-[250px] justify-center">
    <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
      <Check size={12} />
    </div>
    {toast}
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
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

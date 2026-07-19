<script>
  import { onMount } from "svelte";
  import { Tv, Heart, Trash2, Play, Clock, X, ChevronLeft, ChevronRight, LayoutGrid, Rows } from "lucide-svelte";
  import { mediaProgressStore, favoritesStore, deleteMediaProgress, isFavorite, addFavorite, removeFavorite } from "$lib/stores";

  let viewAll = $state(false);
  let mediaToRemove = $state(null);

  let mediaItems = $derived(
    Object.values($mediaProgressStore).sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
  );

  function getImagePath(path) {
    if (!path) return "https://i.imgur.com/HIYYPtZ.png";
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  function getMediaLink(m) {
    return m.type === "tv" && m.last_season_watched && m.last_episode_watched
      ? `/series/${m.id}?season=${m.last_season_watched}&episode=${m.last_episode_watched}`
      : `/${m.type}/${m.id}`;
  }

  function formatWatchTime(s) {
    if (!s || isNaN(s) || s < 0) return "0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function confirmRemove() {
    if (!mediaToRemove) return;
    deleteMediaProgress(mediaToRemove.id);
    mediaToRemove = null;
  }
</script>

{#if mediaItems.length > 0}
  <div class="w-full max-w-[2400px] mx-auto px-4 md:px-8 py-12 relative">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span class="text-xs font-mono text-primary uppercase tracking-widest">Library</span>
        </div>
        <h2 class="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Continue Watching
        </h2>
      </div>

      <div class="flex items-center gap-2 bg-muted p-1.5 rounded-full border border-border">
        <button
          onclick={() => (viewAll = !viewAll)}
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 hover:bg-background/80 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {#if viewAll}
            <Rows size={14} /> Collapse
          {:else}
            <LayoutGrid size={14} /> Grid View
          {/if}
        </button>
      </div>
    </div>

    <!-- Media Cards Grid / Swiper replacement -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
      {#each (viewAll ? mediaItems : mediaItems.slice(0, 5)) as media}
        {@const isTV = media.type === "tv"}
        {@const title = media.title || media.name}
        {@const currentWatched = Number(media.progress?.watched) || 0}
        {@const totalDuration = Number(media.progress?.duration) || 1}
        {@const progressPercent = Math.min((currentWatched / totalDuration) * 100, 100)}
        {@const remainingSeconds = Math.max(0, totalDuration - currentWatched)}
        {@const isFav = isFavorite(media.id, $favoritesStore)}

        <div class="group relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-card ring-1 ring-border isolate transform-gpu select-none">
          <div class="absolute inset-0 z-0 rounded-[2rem] overflow-hidden">
            <div class="absolute inset-0 bg-muted">
              <img
                src={getImagePath(media.poster_path)}
                alt={title}
                class="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
            </div>

            <!-- Progress bar -->
            <div class="absolute bottom-0 left-0 w-full h-1.5 bg-foreground/10 z-20">
              <div class="h-full bg-primary" style="width: {progressPercent}%;" />
            </div>

            <!-- bottom info box -->
            <div class="absolute bottom-1.5 left-0 right-0 p-2 z-10">
              <div class="backdrop-blur-xl border border-border rounded-[1.5rem] overflow-hidden shadow-lg bg-card/40">
                <div class="px-4 pt-4 pb-2">
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm bg-primary text-primary-foreground">
                      {#if isTV && media.last_season_watched}
                        S{media.last_season_watched} E{media.last_episode_watched}
                      {:else}
                        {media.type}
                      {/if}
                    </span>
                  </div>
                  <h3 class="text-lg font-bold leading-tight line-clamp-1 text-foreground mb-1">{title}</h3>
                </div>

                <div class="px-4 pb-4 flex flex-col gap-3">
                  <div class="flex justify-between items-center bg-background/40 rounded-lg p-2.5 border border-border backdrop-blur-sm">
                    <div class="flex items-center gap-2 text-primary">
                      <Clock size={12} />
                      <span class="text-[10px] font-mono font-bold tracking-wider uppercase">
                        {progressPercent > 0 ? `${formatWatchTime(remainingSeconds)} left` : "Not started"}
                      </span>
                    </div>
                    <span class="text-[11px] font-mono font-bold text-foreground tracking-wider">{Math.round(progressPercent)}%</span>
                  </div>

                  <a href={getMediaLink(media)}>
                    <div class="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
                      <Play size={16} class="fill-current text-primary-foreground" />
                      <span>Resume</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- top overlay actions -->
          <div class="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
            <button
              onclick={() => (mediaToRemove = media)}
              class="pointer-events-auto bg-background/40 backdrop-blur-md text-foreground/70 w-10 h-10 rounded-full flex items-center justify-center border border-border shadow-lg hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 cursor-pointer"
            >
              <X size={18} stroke-width="2.5" />
            </button>

            <button
              onclick={() => isFav ? removeFavorite(media.id) : addFavorite(media)}
              class="pointer-events-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 {isFav ? 'bg-primary border-primary text-primary-foreground' : 'bg-background/40 border-border text-foreground hover:bg-foreground hover:text-background'}"
            >
              <Heart size={18} class={isFav ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- Confirmation dialogue -->
{#if mediaToRemove}
  <div class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-background/60 backdrop-blur-sm" onclick={() => (mediaToRemove = null)}></div>
    <div class="bg-card border border-border p-6 sm:p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-sm w-full relative overflow-hidden z-10">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none" />
      <button
        onclick={() => (mediaToRemove = null)}
        class="absolute top-6 right-6 p-2 bg-muted border border-border backdrop-blur-xl rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 hover:scale-110 active:scale-95 transition-all"
      >
        <X size={16} stroke-width="2.5" />
      </button>

      <div class="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 border border-destructive/20 backdrop-blur-md">
        <Trash2 size={24} stroke-width="2.5" />
      </div>

      <h3 class="text-2xl font-bold text-foreground mb-2 tracking-tight">Remove Title?</h3>
      <p class="text-sm text-muted-foreground mb-8 leading-relaxed">
        Are you sure you want to remove <span class="text-foreground font-bold">"{mediaToRemove.title || mediaToRemove.name}"</span> from your watch list?
      </p>

      <div class="flex gap-3">
        <button
          onclick={() => (mediaToRemove = null)}
          class="flex-1 px-4 py-3.5 rounded-full bg-muted hover:bg-muted/80 text-foreground font-bold transition-all border border-border backdrop-blur-md active:scale-95"
        >
          Cancel
        </button>
        <button
          onclick={confirmRemove}
          class="flex-1 px-4 py-3.5 rounded-full bg-destructive text-destructive-foreground font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Trash2 size={18} /> Remove
        </button>
      </div>
    </div>
  </div>
{/if}

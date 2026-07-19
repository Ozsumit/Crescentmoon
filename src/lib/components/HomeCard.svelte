<script>
  import { onMount } from "svelte";
  import { Star, Heart, Play } from "lucide-svelte";
  import { favoritesStore, isFavorite, addFavorite, removeFavorite } from "$lib/stores";

  let { MovieCard } = $props();

  let imageLoaded = $state(false);

  let isTV = $derived(MovieCard.media_type === "tv" || MovieCard.first_air_date !== undefined);
  let title = $derived(isTV ? MovieCard.name : MovieCard.title);
  let linkPath = $derived(isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`);
  let releaseYear = $derived(MovieCard.release_date || MovieCard.first_air_date ? new Date(MovieCard.release_date || MovieCard.first_air_date).getFullYear() : "N/A");

  let isFav = $derived(isFavorite(MovieCard.id, $favoritesStore));

  function handleFavoriteToggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFav) {
      removeFavorite(MovieCard.id);
    } else {
      addFavorite(MovieCard);
    }
  }

  function getImagePath() {
    if (MovieCard.poster_path) {
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    }
    return "https://i.imgur.com/HIYYPtZ.png";
  }
</script>

<div class="group relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-card ring-1 ring-border transform-gpu transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
  <a href={linkPath} class="absolute inset-0 z-0 rounded-[2rem] overflow-hidden block">
    <div class="absolute inset-0 bg-muted">
      <img
        src={getImagePath()}
        alt={title}
        onload={() => (imageLoaded = true)}
        class="object-cover w-full h-full transition-all duration-700 ease-out transform-gpu group-hover:scale-110 {imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-2 z-10">
      <div class="border border-border rounded-[1.5rem] overflow-hidden shadow-md bg-card/50 dark:bg-card/80 backdrop-blur-sm transition-transform duration-300 transform-gpu translate-y-0 group-hover:-translate-y-1">
        <div class="px-4 pt-4 pb-2">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm {isTV ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}">
                {isTV ? "Series" : "Movie"}
              </span>
              {#if MovieCard.vote_average > 0}
                <div class="flex items-center gap-1 text-xs font-bold text-primary">
                  <Star size={12} class="fill-primary" />
                  <span>{MovieCard.vote_average.toFixed(1)}</span>
                </div>
              {/if}
            </div>
          </div>
          <h3 class="text-lg font-black leading-tight line-clamp-1 text-foreground mb-1 group-hover:text-primary transition-colors drop-shadow-sm">
            {title}
          </h3>
        </div>

        <!-- Height hover transition -->
        <div class="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
          <div class="overflow-hidden">
            <div class="px-4 pb-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <p class="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                {MovieCard.overview || "No description available."}
              </p>
              <div class="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Play size={16} class="fill-primary-foreground" />
                <span>Watch Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a>

  <!-- Floating Metadata top overlay -->
  <div class="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
    <div class="bg-background/95 text-foreground text-[11px] font-black px-3 py-1.5 rounded-full shadow-md border border-border">
      {releaseYear}
    </div>

    <button
      onclick={handleFavoriteToggle}
      class="pointer-events-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full shadow-md border transition-transform duration-300 hover:scale-110 active:scale-90 {isFav ? 'bg-destructive border-destructive text-destructive-foreground' : 'bg-background/30 border-border text-foreground hover:bg-foreground hover:text-background hover:border-foreground'}"
    >
      <div class="transition-all duration-300">
        {#if isFav}
          <Heart size={18} class="fill-[#690005]" />
        {:else}
          <Heart size={18} />
        {/if}
      </div>
    </button>
  </div>
</div>

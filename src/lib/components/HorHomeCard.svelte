<script>
  import { onMount } from "svelte";
  import { Star, Calendar, PlayCircle, Heart } from "lucide-svelte";
  import { favoritesStore, isFavorite, addFavorite, removeFavorite } from "$lib/stores";

  let { MovieCard, className = "" } = $props();

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

<div class="w-full transform-gpu relative group animate-in fade-in duration-500 ease-out">
  <!-- FAVORITE BUTTON -->
  <button
    onclick={handleFavoriteToggle}
    class="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full shadow-md border transition-transform duration-300 ease-out hover:scale-110 active:scale-90 {isFav ? 'bg-destructive border-destructive text-destructive-foreground' : 'bg-background/80 border-border text-foreground hover:bg-background'}"
  >
    <div class="transition-all duration-300">
      {#if isFav}
        <Heart size={16} class="fill-[#690005]" />
      {:else}
        <Heart size={16} class="text-neutral-400" />
      {/if}
    </div>
  </button>

  <!-- MAIN CARD LINK -->
  <a
    href={linkPath}
    class="flex w-full h-40 bg-card rounded-[2rem] overflow-hidden border border-border shadow-md hover:shadow-2xl hover:border-foreground/20 hover:bg-card/80 transition-all duration-300 {className}"
  >
    <!-- LEFT: IMAGE -->
    <div class="p-2 h-full w-[120px] flex-shrink-0">
      <div class="relative h-full w-full rounded-[1.5rem] overflow-hidden bg-neutral-900 shadow-inner">
        <img
          src={getImagePath()}
          alt={title}
          onload={() => (imageLoaded = true)}
          class="object-cover w-full h-full transition-all duration-700 {imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'} group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
    </div>

    <!-- RIGHT: INFO -->
    <div class="flex-1 py-3 pr-4 pl-2 flex flex-col justify-center gap-1.5 relative">
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors duration-300 {isTV ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}">
          {isTV ? "TV" : "FILM"}
        </span>

        {#if MovieCard.vote_average > 0}
          <div class="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-foreground text-[10px] font-bold">
            <Star size={10} class="fill-foreground text-foreground" />
            {MovieCard.vote_average.toFixed(1)}
          </div>
        {/if}
      </div>

      <div class="pr-8">
        <h3 class="text-lg font-bold text-foreground leading-tight line-clamp-1 mb-0.5 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
      </div>

      <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Calendar size={12} />
        <span>{releaseYear}</span>
      </div>

      <p class="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
        {MovieCard.overview || "No description available."}
      </p>

      <div class="mt-auto flex justify-end">
        <div class="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-transform">
          <PlayCircle size={14} class="fill-primary-foreground text-primary" />
          WATCH
        </div>
      </div>
    </div>
  </a>
</div>

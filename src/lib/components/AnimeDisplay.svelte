<script>
  import { onMount } from "svelte";
  import { Filter, X, Heart, Star, Calendar, Info } from "lucide-svelte";

  let animes = $state([]);
  let page = $state(1);
  let totalPages = $state(1);
  let isLoading = $state(false);
  let error = $state(null);
  let activeGenres = $state([]);
  let isGenreMenuOpen = $state(false);
  let genres = $state([]);
  let favorites = $state([]);

  onMount(async () => {
    // Fetch genres
    try {
      const response = await fetch("https://api.jikan.moe/v4/genres/anime");
      const data = await response.json();
      genres = data.data || [];
    } catch (e) {
      console.error(e);
    }

    const storedFavorites = JSON.parse(localStorage.getItem("animeFavorites")) || [];
    favorites = storedFavorites;

    fetchAnime(1);
  });

  async function fetchAnime(currentPage, genreIds = []) {
    isLoading = true;
    error = null;

    try {
      const genreParam = genreIds.length > 0 ? `&genres=${genreIds.join(",")}` : "";
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?page=${currentPage}&limit=24&order_by=popularity${genreParam}&sfw=true`
      );

      if (!response.ok) throw new Error("Failed to fetch anime");
      const data = await response.json();

      animes = (data.data || []).map((item) => ({
        id: item.mal_id,
        title: item.title,
        image: item.images.jpg.large_image_url,
        score: item.score,
        genres: item.genres,
        type: item.type,
        status: item.status,
        synopsis: item.synopsis,
        aired: item.aired?.from,
        episodes: item.episodes,
      }));

      totalPages = Math.ceil((data.pagination?.items?.total || 240) / 24);
      page = currentPage;
    } catch (err) {
      console.error(err);
      error = "Unable to load anime. Please try again later.";
    } finally {
      isLoading = false;
    }
  }

  function toggleGenre(genre) {
    activeGenres = activeGenres.some((g) => g.mal_id === genre.mal_id)
      ? activeGenres.filter((g) => g.mal_id !== genre.mal_id)
      : [...activeGenres, genre];
    page = 1;
    fetchAnime(1, activeGenres.map(g => g.mal_id));
  }

  function clearGenres() {
    activeGenres = [];
    page = 1;
    fetchAnime(1);
  }

  function toggleFavorite(anime) {
    const isFav = favorites.some((f) => f.id === anime.id);
    favorites = isFav
      ? favorites.filter((f) => f.id !== anime.id)
      : [...favorites, anime];
    localStorage.setItem("animeFavorites", JSON.stringify(favorites));
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  }
</script>

<div class="w-full px-2 sm:px-4 md:px-6 mb-8 mt-12 lg:px-8 xl:px-12">
  <div class="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-border">
    <div class="p-4 sm:p-6 md:p-8">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-6 text-foreground tracking-tighter uppercase">
        {#if activeGenres.length > 0}
          {activeGenres.map((g) => g.name).join(", ")} Anime
        {:else}
          Popular Anime
        {/if}
      </h2>

      <div class="flex flex-col items-center space-y-4 mb-6 relative">
        <div class="flex flex-wrap justify-end items-center gap-2 sm:gap-4">
          <button
            onclick={() => (isGenreMenuOpen = !isGenreMenuOpen)}
            class="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Filter class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="text-xs sm:text-sm">Filter Genres</span>
            {#if activeGenres.length > 0}
              <span class="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs">
                {activeGenres.length}
              </span>
            {/if}
          </button>

          {#if activeGenres.length > 0}
            <button
              onclick={clearGenres}
              class="text-muted-foreground hover:text-foreground flex items-center space-x-1 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              <X class="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Clear Filters</span>
            </button>
          {/if}
        </div>

        {#if isGenreMenuOpen}
          <div class="absolute z-50 mt-2 p-6 bg-card border border-border rounded-[2rem] shadow-2xl max-h-96 overflow-y-auto backdrop-blur-2xl">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {#each genres as genre}
                {@const isSelected = activeGenres.some((g) => g.mal_id === genre.mal_id)}
                <button
                  onclick={() => toggleGenre(genre)}
                  class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer {isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-foreground/5'}"
                >
                  {genre.name}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      {#if isLoading}
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span class="ml-3 text-primary text-sm font-mono uppercase tracking-widest">Loading...</span>
        </div>
      {:else if error}
        <div class="text-center py-8 text-destructive font-bold uppercase tracking-widest">{error}</div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 animate-in fade-in duration-300">
          {#each animes as anime}
            {@const isFav = favorites.some((f) => f.id === anime.id)}
            <a href="/anime/{anime.id}">
              <div class="bg-card rounded-xl h-[14rem] cursor-pointer sm:h-auto overflow-hidden shadow-xl border border-border relative group">
                <div class="block relative">
                  <img
                    src={anime.image || "https://i.imgur.com/HIYYPtZ.png"}
                    alt={anime.title}
                    class="w-full h-32 sm:h-48 object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                  <div class="absolute top-2 left-2 bg-background/40 text-foreground px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm border border-border">
                    {anime.type || "TV"}
                  </div>
                </div>

                <div class="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-foreground backdrop-blur-sm">
                  <p class="text-sm mb-3 line-clamp-3 leading-relaxed">{anime.synopsis || "No synopsis available"}</p>
                  <button class="flex items-center text-xs sm:text-sm hover:text-primary transition-colors font-bold uppercase tracking-wider">
                    <Info size={16} class="mr-2" />
                    More Details
                  </button>
                </div>

                <div class="p-4">
                  <h3 class="text-center text-foreground font-semibold text-base mb-2 line-clamp-1">{anime.title}</h3>
                  <div class="flex flex-col lg:flex-row justify-between items-center text-xs text-muted-foreground">
                    <div class="flex items-center">
                      <Star size={14} class="mr-1 text-accent-foreground fill-current" />
                      <span>{anime.score ? `${anime.score.toFixed(1)}/10` : "N/A"}</span>
                    </div>
                    <div class="flex items-center">
                      <Calendar size={14} class="mr-1" />
                      <span>{formatDate(anime.aired)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(anime);
                  }}
                  class="absolute top-2 right-2 z-20 bg-background/50 rounded-full p-2 hover:bg-background/70 transition-colors border border-border cursor-pointer"
                >
                  <Heart
                    size={20}
                    class={isFav ? "text-primary fill-current" : "text-foreground"}
                  />
                </button>
              </div>
            </a>
          {/each}
        </div>
      {/if}

      {#if !isLoading && !error && totalPages > 1}
        <div class="mt-8 flex justify-center items-center gap-4">
          <button
            onclick={() => { page = Math.max(1, page - 1); fetchAnime(page, activeGenres.map(g => g.mal_id)); }}
            disabled={page === 1}
            class="px-6 py-2.5 bg-primary text-primary-foreground rounded-full disabled:opacity-30 hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
          >
            Previous
          </button>
          <span class="text-foreground font-mono text-sm font-bold">{page} / {totalPages}</span>
          <button
            onclick={() => { page = Math.min(totalPages, page + 1); fetchAnime(page, activeGenres.map(g => g.mal_id)); }}
            disabled={page === totalPages}
            class="px-6 py-2.5 bg-primary text-primary-foreground rounded-full disabled:opacity-30 hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
          >
            Next
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

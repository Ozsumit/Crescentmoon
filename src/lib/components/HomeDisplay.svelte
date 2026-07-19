<script>
  import { onMount, tick } from "svelte";
  import { Filter, X, Film, Binoculars, Tv, ArrowUp } from "lucide-svelte";
  import ContinueWatching from "./ContinueWatching.svelte";
  import RecommendedMovies from "./RecommendedMovies.svelte";
  import HomeCard from "./HomeCard.svelte";
  import HorHomeCard from "./HorHomeCard.svelte";

  let { initialData = [] } = $props();

  let activeTab = $state("all");
  let page = $state(1);
  let totalPages = $state(500);
  let loading = $state(false);
  let showTopBtn = $state(false);

  let moviesList = $state([]);
  let tvShowsList = $state([]);

  const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";

  onMount(async () => {
    // Separate initial data into movie / tv
    moviesList = initialData.filter((i) => i.media_type === "movie");
    tvShowsList = initialData.filter((i) => i.media_type === "tv");

    window.addEventListener("scroll", () => {
      showTopBtn = window.scrollY > 500;
    });
  });

  async function fetchPage(tabVal, pNum) {
    if (tabVal === "all") return;
    loading = true;
    const type = tabVal === "movies" ? "movie" : "tv";
    try {
      const resp = await fetch(
        `https://api.themoviedb.org/3/${type}/popular?api_key=${apiKey}&page=${pNum}&language=en-US`
      );
      if (resp.ok) {
        const data = await resp.json();
        const results = (data.results || []).map((item) => ({
          ...item,
          media_type: type
        }));
        if (tabVal === "movies") {
          moviesList = results;
        } else {
          tvShowsList = results;
        }
        totalPages = Math.min(data.total_pages, 500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (activeTab !== "all") {
      fetchPage(activeTab, page);
    }
  });

  function handleTabChange(tab) {
    activeTab = tab;
    page = 1;
  }

  function handlePageChange(pNum) {
    page = pNum;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  let currentItems = $derived(
    activeTab === "all"
      ? [...moviesList, ...tvShowsList].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      : activeTab === "movies"
        ? moviesList
        : tvShowsList
  );
</script>

<div class="w-full max-w-[2400px] mx-auto px-2 sm:px-6 lg:px-12 pb-24 transform-gpu">
  <section class="mb-12">
    <ContinueWatching />
  </section>

  <div class="bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-2xl relative contain-layout">
    <div class="relative z-40 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
      <div class="space-y-2">
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
          Trending Now
        </h2>
      </div>
    </div>

    <!-- Tabs header -->
    <div class="w-full border-b border-border pb-1 mb-8">
      <div class="flex gap-8">
        {#each ["all", "movies", "tv"] as tab}
          {@const isActive = activeTab === tab}
          <button
            onclick={() => handleTabChange(tab)}
            class="relative pb-4 bg-transparent text-lg md:text-xl font-medium tracking-tight transition-colors text-muted-foreground hover:text-foreground cursor-pointer {isActive ? 'text-foreground font-bold' : ''}"
          >
            <span class="flex items-center gap-2">
              {#if tab === "all"}
                <Binoculars size={18} /> Discover
              {:else}
                {#if tab === "movies"}
                  <Film size={18} /> Movies
                {:else}
                  <Tv size={18} /> TV Series
                {/if}
              {/if}
            </span>
            {#if isActive}
              <div class="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-primary transition-all duration-300 transform-gpu" />
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Listing grid -->
    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {#each Array(10) as _}
          <div class="aspect-[2/3] bg-muted animate-pulse rounded-[2rem]" />
        {/each}
      </div>
    {:else}
      <div class="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8 z-20">
        {#each currentItems as item}
          <HomeCard MovieCard={item} />
        {/each}
      </div>
      <div class="grid lg:hidden grid-cols-1 gap-4">
        {#each currentItems as item}
          <HorHomeCard MovieCard={item} />
        {/each}
      </div>
    {/if}

    <!-- Pagination -->
    {#if activeTab !== "all" && !loading}
      <div class="mt-12 flex justify-center items-center gap-2 border-t border-border pt-8">
        <button
          disabled={page <= 1}
          onclick={() => handlePageChange(page - 1)}
          class="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          Prev
        </button>
        <span class="text-xs font-mono font-bold">Page {page} / {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onclick={() => handlePageChange(page + 1)}
          class="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    {/if}

    <RecommendedMovies />
  </div>
</div>

{#if showTopBtn}
  <button
    onclick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    class="fixed bottom-8 right-8 z-50 p-4 rounded-[1.5rem] bg-primary text-primary-foreground shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
  >
    <ArrowUp size={24} />
  </button>
{/if}

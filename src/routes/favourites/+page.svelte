<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { Star, Calendar, Trash2 } from "lucide-svelte";
  import HomeCard from "$lib/components/HomeCard.svelte";
  import HorHomeCard from "$lib/components/HorHomeCard.svelte";
  import { favoritesStore } from "$lib/stores";

  let activeTab = $state("all");

  const defaultMovies = [
    {
      id: 545611,
      title: "Everything Everywhere All at Once",
      poster_path: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
      release_date: "2022-03-24",
      vote_average: 7.8,
      overview: "An aging Chinese immigrant is swept up in an insane adventure...",
    },
    {
      id: 640,
      title: "Catch Me If You Can",
      poster_path: "/sdYgEkKCDPWNU6KnoL4qd8xZ4w7.jpg",
      release_date: "2002-12-25",
      vote_average: 8.0,
      overview: "A true story about Frank Abagnale Jr...",
    },
    {
      id: 19913,
      title: "(500) Days of Summer",
      poster_path: "/f9mbM0YMLpYemcWx6o2WeiYQLDP.jpg",
      release_date: "2009-07-17",
      vote_average: 7.3,
      overview: "An offbeat romantic comedy...",
    }
  ];

  onMount(() => {
    const stored = localStorage.getItem("favorites");
    if (!stored) {
      favoritesStore.set(defaultMovies);
    }
  });

  let favorites = $derived($favoritesStore || []);

  let filteredFavorites = $derived(
    favorites.filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "series") return item.first_air_date || item.media_type === "tv";
      if (activeTab === "movies") return item.release_date || item.media_type === "movie";
      return true;
    })
  );

  let movieCount = $derived(favorites.filter((i) => i.release_date || i.media_type === "movie").length);
  let seriesCount = $derived(favorites.filter((i) => i.first_air_date || i.media_type === "tv").length);
</script>

<div class="min-h-screen pt-24 pb-20 bg-background text-foreground relative selection:bg-primary/30">
  <div class="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

  <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-[2000px]">
    <header class="mb-12 flex flex-col md:flex-row items-end justify-between gap-6 border-b border-border pb-8">
      <div>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-2">ARCHIVE</h1>
        <p class="text-sm md:text-base font-mono text-muted-foreground uppercase tracking-widest">
          Personal Collection • {favorites.length} Items
        </p>
      </div>

      <div class="flex gap-4">
        <div class="px-5 py-3 bg-card border border-border rounded-xl backdrop-blur-sm shadow-sm">
          <div class="text-2xl font-bold text-primary">{movieCount}</div>
          <div class="text-[10px] font-mono text-muted-foreground uppercase">Movies</div>
        </div>
        <div class="px-5 py-3 bg-card border border-border rounded-xl backdrop-blur-sm shadow-sm">
          <div class="text-2xl font-bold text-secondary-foreground">{seriesCount}</div>
          <div class="text-[10px] font-mono text-muted-foreground uppercase">Series</div>
        </div>
      </div>
    </header>

    <!-- Tab options switcher -->
    <div class="flex gap-4 border-b border-border pb-4 mb-8">
      {#each ["all", "movies", "series"] as tab}
        <button
          onclick={() => (activeTab = tab)}
          class="px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer {activeTab === tab ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}"
        >
          {tab}
        </button>
      {/each}
    </div>

    <!-- Listings -->
    {#if filteredFavorites.length > 0}
      <div class="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
        {#each filteredFavorites as show}
          <HomeCard MovieCard={show} />
        {/each}
      </div>
      <div class="grid lg:hidden grid-cols-1 gap-4">
        {#each filteredFavorites as show}
          <HorHomeCard MovieCard={show} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-24 bg-card rounded-[2rem] border border-dashed border-border p-12">
        <p class="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-2">Nothing found</p>
        <p class="text-xs text-muted-foreground max-w-sm mx-auto">This tab of your archive collection is currently empty.</p>
      </div>
    {/if}
  </div>
</div>

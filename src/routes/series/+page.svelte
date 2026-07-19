<script>
  import HomeCard from "$lib/components/HomeCard.svelte";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let series = $derived(data.series || []);
  let currentPage = $derived(data.page || 1);
  let totalPages = $derived(data.totalPages || 1);

  function handlePageChange(newPage) {
    goto(`/series?page=${newPage}`);
  }
</script>

<div class="min-h-screen w-full bg-background text-foreground selection:bg-primary/30 pt-16">
  <!-- Ambient glow -->
  <div class="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none z-0" />

  <div class="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 py-16">
    <div class="mb-16 flex flex-col items-start gap-4">
      <h1 class="text-5xl font-bold tracking-tight md:text-7xl text-foreground">
        TV Series
      </h1>
      <p class="max-w-xl text-lg text-muted-foreground font-medium">
        Explore trending television series, multi-season anime episodes, and stellar storylines.
      </p>
    </div>

    <!-- Card Grid -->
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 xl:gap-8">
      {#each series as show}
        <HomeCard MovieCard={show} />
      {/each}
    </div>

    <!-- Pagination -->
    <div class="mt-24 flex justify-center">
      <div class="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-xl shadow-2xl flex items-center gap-4">
        <button
          disabled={currentPage <= 1}
          onclick={() => handlePageChange(currentPage - 1)}
          class="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          Prev
        </button>
        <span class="text-xs font-mono font-bold">Page {currentPage} / {totalPages}</span>
        <button
          disabled={currentPage >= totalPages}
          onclick={() => handlePageChange(currentPage + 1)}
          class="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</div>

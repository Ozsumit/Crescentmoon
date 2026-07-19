<script>
  import { onMount } from "svelte";
  import { Star, Film } from "lucide-svelte";

  let movies = $state([]);

  onMount(async () => {
    try {
      const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
      const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`);
      if (res.ok) {
        const data = await res.json();
        movies = (data.results || []).slice(0, 6);
      }
    } catch (e) {
      console.error(e);
    }
  });
</script>

{#if movies.length > 0}
  <div class="mt-12">
    <h3 class="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-2">
      <Film size={18} class="text-primary" /> Recommended Movies
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {#each movies as m}
        <a href="/movie/{m.id}" class="group block relative aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-105">
          {#if m.poster_path}
            <img src="https://image.tmdb.org/t/p/w342{m.poster_path}" alt={m.title} class="object-cover w-full h-full" />
          {:else}
            <div class="flex items-center justify-center w-full h-full text-muted-foreground bg-muted">
              No Poster
            </div>
          {/if}
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
          <div class="absolute bottom-2 left-2 right-2">
            <p class="text-xs font-bold text-foreground line-clamp-1 leading-tight mb-0.5">{m.title}</p>
            <div class="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
              <Star size={10} class="fill-current text-amber-400" />
              <span>{m.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
{/if}

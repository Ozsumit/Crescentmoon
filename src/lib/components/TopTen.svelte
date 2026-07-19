<script>
  import { onMount } from "svelte";
  import { Star, Play, Plus } from "lucide-svelte";

  let trending = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      trending = (data.results || []).slice(0, 5);
    } catch (err) {
      console.warn("Falling back to top-ten mock data:", err);
      trending = Array.from({ length: 5 }).map((_, i) => ({
        id: `mock-${i}`,
        title: i % 2 === 0 ? "Swiss Editorial Title" : "Dynamic Material Block",
        poster_path: null,
        media_type: i % 2 === 0 ? "movie" : "tv",
        vote_average: 8.5 - i * 0.1,
      }));
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="w-full py-16 px-6 bg-background">
    <div class="h-12 w-64 bg-secondary/60 animate-pulse rounded-[1rem] mb-12" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {#each Array(5) as _}
        <div class="aspect-[2/3] w-full bg-secondary/40 animate-pulse rounded-[2rem]" />
      {/each}
    </div>
  </div>
{:else}
  <section class="w-full py-16 px-4 sm:px-6 md:px-12 lg:px-16 bg-background text-foreground overflow-hidden">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mb-12">
      <div class="space-y-2">
        <p class="text-xs font-black uppercase tracking-widest text-primary/80">
          Current Leaderboard
        </p>
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
          Top 5 Today
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-y-16 gap-x-8">
      {#each trending as item, index}
        {@const isTV = item.media_type === "tv"}
        {@const title = item.title || item.name || "Untitled"}
        {@const href = isTV ? `/series/${item.id}` : `/movie/${item.id}`}
        {@const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500/${item.poster_path}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop"}

        <div class="flex flex-col relative">
          <!-- Massive index behind -->
          <div class="absolute -top-12 -left-3 select-none pointer-events-none z-0">
            <span class="text-[120px] font-black leading-none tracking-tighter text-secondary font-sans opacity-70">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <!-- Card Container -->
          <div class="relative z-10 flex-1 flex flex-col bg-secondary/30 rounded-[2rem] p-4 border border-border/50 hover:border-border/100 hover:bg-secondary/50 transition-all duration-300">
            <a href={href} class="relative block aspect-[4/5] rounded-[1.5rem] overflow-hidden group mb-4">
              <img
                src={poster}
                alt={title}
                class="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              <div class="absolute top-3 left-3 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-foreground border border-border/50">
                {isTV ? "Series" : "Movie"}
              </div>
            </a>

            <div class="flex-1 flex flex-col justify-between px-1">
              <div>
                <h3 class="text-base font-bold leading-tight tracking-tight text-foreground line-clamp-2 mb-1 hover:text-primary transition-colors">
                  <a href={href}>{title}</a>
                </h3>

                {#if item.vote_average}
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star size={12} class="fill-accent text-accent" />
                    <span class="font-bold text-foreground">
                      {item.vote_average.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span class="uppercase text-[9px] font-bold tracking-widest text-muted-foreground">
                      #{index + 1} Trending
                    </span>
                  </div>
                {/if}
              </div>

              <div class="flex items-center gap-2 mt-4 pt-3 border-t border-border/40">
                <a
                  href={href}
                  class="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 duration-200"
                >
                  <Play size={11} class="fill-current stroke-none" />
                  <span>Details</span>
                </a>

                <button class="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border/60 transition-colors duration-200 cursor-pointer">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

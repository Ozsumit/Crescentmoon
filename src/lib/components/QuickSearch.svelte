<script>
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { Loader2, Search, Film, Tv, ArrowRight, Command, CornerDownLeft, Calendar, Star, TrendingUp, Layers } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let { open = $bindable(false) } = $props();

  const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";

  let searchResults = $state([]);
  let trending = $state([]);
  let searchTerm = $state("");
  let isLoading = $state(false);
  let selectedIndex = $state(0);

  let cache = new Map();
  let debounceTimer;

  onMount(async () => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`);
      const data = await res.json();
      trending = (data.results || [])
        .filter((i) => i.media_type === "movie" || i.media_type === "tv")
        .slice(0, 5);
    } catch (e) {
      console.error(e);
    }
  });

  // Phonetic Generator
  function generatePhoneticVariations(q) {
    if (!q) return [];
    const lowerQ = q.toLowerCase();
    const phoneticMap = [
      { rules: ["i", "ee", "ea", "y"] },
      { rules: ["u", "oo", "ou"] },
      { rules: ["v", "w", "b"] },
      { rules: ["ph", "f", "gh"] },
      { rules: ["c", "k", "q", "ch"] },
      { rules: ["s", "z", "sh", "c"] },
      { rules: ["g", "j", "ge"] },
      { rules: ["ae", "ai", "ay", "a"] },
      { rules: ["o", "oa", "ow"] },
      { rules: ["t", "d"] },
      { rules: ["m", "n"] }
    ];
    const variations = new Set();

    function permute(str, index = 0) {
      if (index >= str.length) {
        variations.add(str);
        return;
      }
      let matched = false;
      for (const group of phoneticMap) {
        for (const rule of group.rules) {
          if (str.startsWith(rule, index)) {
            matched = true;
            for (const replacement of group.rules) {
              const nextStr = str.slice(0, index) + replacement + str.slice(index + rule.length);
              permute(nextStr, index + replacement.length);
            }
          }
        }
      }
      if (!matched) permute(str, index + 1);
    }

    permute(lowerQ);
    return Array.from(variations).filter((v) => v !== lowerQ).slice(0, 5);
  }

  async function fetchOmniSearch(query) {
    const fetchTMDB = async (q) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(q)}&page=1`
      );
      return res.json();
    };

    const queriesToRun = new Set([query]);
    if (query.length > 2) {
      generatePhoneticVariations(query).forEach((v) => queriesToRun.add(v));
    }

    const queriesArray = Array.from(queriesToRun).slice(0, 3);
    const responses = await Promise.all(
      queriesArray.map((q) => fetchTMDB(q).catch(() => ({ results: [] })))
    );

    const allResults = [];
    const seenIds = new Set();

    responses.forEach((res, index) => {
      const isExactMatch = index === 0;
      (res.results || []).forEach((item) => {
        if (item.media_type === "movie" || item.media_type === "tv") {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            item._sortScore = (isExactMatch ? 10000 : 0) + (item.popularity || 0);
            allResults.push(item);
          }
        }
      });
    });

    return allResults.sort((a, b) => b._sortScore - a._sortScore).slice(0, 8);
  }

  $effect(() => {
    const q = searchTerm.trim();
    if (!q) {
      searchResults = [];
      isLoading = false;
      return;
    }

    if (cache.has(q.toLowerCase())) {
      searchResults = cache.get(q.toLowerCase());
      return;
    }

    isLoading = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const results = await fetchOmniSearch(q);
        cache.set(q.toLowerCase(), results);
        searchResults = results;
      } catch (err) {
        console.error(err);
      } finally {
        isLoading = false;
      }
    }, 300);
  });

  let currentList = $derived(searchTerm ? searchResults : trending);

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      open = false;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % currentList.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + currentList.length) % currentList.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(currentList[selectedIndex]);
    }
  }

  function handleSelect(item) {
    if (!item) return;
    open = false;
    searchTerm = "";
    const href = item.media_type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`;
    goto(href);
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="dialog"
    onclick={() => (open = false)}
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={(e) => e.stopPropagation()}
      transition:scale={{ start: 0.95, duration: 200 }}
      class="w-full max-w-2xl bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-[24px] overflow-hidden flex flex-col"
    >
      <!-- Input Area -->
      <div class="relative flex items-center h-16 sm:h-20 px-4 sm:px-6 border-b border-border bg-muted/20">
        <Search class="w-5 h-5 {isLoading ? 'text-primary' : 'text-muted-foreground'}" />
        <input
          class="flex-1 h-full bg-transparent border-none outline-none px-3 sm:px-4 text-base sm:text-lg font-medium text-foreground placeholder-muted-foreground w-full focus:ring-0"
          placeholder="Search titles or phonetics..."
          bind:value={searchTerm}
          onkeydown={handleKeyDown}
          autofocus
          autocomplete="off"
          spellcheck="false"
        />
        {#if isLoading}
          <Loader2 class="w-5 h-5 animate-spin text-primary" />
        {:else}
          <div class="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-muted border border-border text-[10px] font-mono text-muted-foreground select-none">
            <span>ESC</span>
          </div>
        {/if}
      </div>

      <!-- Results List -->
      <div class="min-h-[340px] max-h-[60vh] sm:max-h-[480px] overflow-y-auto p-2 sm:p-3">
        {#if currentList.length > 0}
          <div class="grid gap-1">
            <div class="px-3 py-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 select-none">
              {#if searchTerm}
                <Layers size={12} class="text-primary" /> Matches & Guesses
              {:else}
                <TrendingUp size={12} class="text-sky-500" /> Trending Today
              {/if}
              <div class="h-px bg-border/60 flex-1" />
            </div>

            {#each currentList as item, index}
              {@const isSelected = index === selectedIndex}
              {@const title = item.title || item.name}
              {@const year = item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date).getFullYear() : "N/A"}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div
                onclick={() => handleSelect(item)}
                class="group relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors duration-150 select-none {isSelected ? 'bg-muted/80 text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'}"
              >
                <!-- Thumbnail -->
                <div class="relative z-10 flex-shrink-0 w-12 h-16 rounded-[6px] overflow-hidden bg-muted shadow-sm ring-1 ring-border">
                  {#if item.poster_path}
                    <img
                      src="https://image.tmdb.org/t/p/w92{item.poster_path}"
                      alt={title}
                      class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  {:else}
                    <div class="flex items-center justify-center w-full h-full text-muted-foreground bg-muted">
                      {#if item.media_type === "movie"}
                        <Film size={20} />
                      {:else}
                        <Tv size={20} />
                      {/if}
                    </div>
                  {/if}
                </div>

                <!-- Text metadata -->
                <div class="relative z-10 flex-1 min-w-0 flex flex-col gap-1">
                  <div class="flex items-center justify-between gap-2">
                    <h4 class="text-sm sm:text-base font-semibold truncate text-foreground">{title}</h4>
                    {#if item.vote_average > 0}
                      <div class="flex items-center gap-1 text-[10px] font-mono bg-muted-foreground/15 px-1.5 py-0.5 rounded text-foreground backdrop-blur-md">
                        <Star size={8} class="fill-amber-500 text-amber-500" />
                        <span>{item.vote_average.toFixed(1)}</span>
                      </div>
                    {/if}
                  </div>

                  <div class="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/90">
                    <span class="flex items-center gap-1.5 font-bold">
                      <span class="w-1.5 h-1.5 rounded-full {item.media_type === 'movie' ? 'bg-primary' : 'bg-sky-500'}" />
                      {item.media_type === 'movie' ? 'MOVIE' : 'SERIES'}
                    </span>
                    <span class="w-px h-3 bg-border" />
                    <span class="flex items-center gap-1">
                      <Calendar size={10} />
                      {year}
                    </span>
                  </div>
                </div>

                <div class="relative z-10 flex-shrink-0 transition-all duration-200 {isSelected ? 'opacity-100' : 'opacity-0'}">
                  <ArrowRight size={16} />
                </div>
              </div>
            {/each}
          </div>
        {:else if !isLoading}
          <div class="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-14">
            <Search size={20} />
            <div class="text-center">
              <p class="text-sm font-medium text-foreground mb-1">No matching records found</p>
              <p class="text-xs max-w-[280px] mx-auto text-muted-foreground/80 leading-relaxed">
                Checked exact matches, phonetics, and misspellings for <span class="text-primary font-semibold">"{searchTerm}"</span>.
              </p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer specs -->
      <div class="h-11 bg-muted/10 border-t border-border flex items-center justify-between px-4 sm:px-6 text-[10px] font-mono text-muted-foreground uppercase tracking-wider select-none">
        <div>
          {#if currentList.length > 0}
            <span>{currentList.length} items cataloged</span>
          {/if}
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden md:flex items-center gap-1.5">
            <span>NAVIGATE</span>
          </span>
          <div class="w-px h-3 bg-border hidden md:block" />
          <span class="hidden sm:flex items-center gap-1.5">
            <CornerDownLeft size={10} />
            <span>OPEN</span>
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}

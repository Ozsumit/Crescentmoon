<script>
  import { onMount } from "svelte";
  import { Tv, Film, Calendar, Star, Play, Info, ArrowRight, Pause, VolumeX, Volume2 } from "lucide-svelte";

  let spotlights = $state([]);
  let currentSlide = $state(0);
  let isPaused = $state(false);
  let isMuted = $state(true);
  let trailers = $state({});
  let showTrailer = $state(false);
  let isLoading = $state(true);
  let isMobile = $state(false);

  let videoRef;
  let autoplayInterval;

  onMount(async () => {
    isMobile = window.innerWidth < 768;
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
    };
    window.addEventListener("resize", handleResize);

    const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
    const URL = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;

    try {
      const response = await fetch(URL);
      const data = await response.json();
      spotlights = (data.results || []).slice(0, 10);
    } catch (error) {
      console.error("Error fetching spotlight data:", error);
    } finally {
      isLoading = false;
    }

    startAutoplay();

    return () => {
      window.removeEventListener("resize", handleResize);
      stopAutoplay();
    };
  });

  async function fetchTrailer(id, mediaType) {
    if (trailers[id]) return;
    const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
    const URL = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${apiKey}`;
    try {
      const response = await fetch(URL);
      const data = await response.json();
      const trailer = (data.results || []).find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      if (trailer) {
        trailers = { ...trailers, [id]: trailer.key };
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (!isPaused) {
      autoplayInterval = setInterval(handleNextSlide, 15000);
    }
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  $effect(() => {
    if (spotlights.length > 0) {
      const currentItem = spotlights[currentSlide];
      fetchTrailer(currentItem.id, currentItem.media_type);

      const nextSlideIndex = (currentSlide + 1) % spotlights.length;
      const nextItem = spotlights[nextSlideIndex];
      fetchTrailer(nextItem.id, nextItem.media_type);
    }
  });

  function handleNextSlide() {
    showTrailer = false;
    currentSlide = (currentSlide + 1) % spotlights.length;
    if (!isMobile) {
      setTimeout(() => (showTrailer = true), 5000);
    }
  }

  function handlePrevSlide() {
    showTrailer = false;
    currentSlide = currentSlide === 0 ? spotlights.length - 1 : currentSlide - 1;
  }

  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) stopAutoplay();
    else startAutoplay();
  }

  function toggleMute() {
    isMuted = !isMuted;
  }

  let currentItem = $derived(spotlights[currentSlide]);
  let title = $derived(currentItem ? (currentItem.title || currentItem.name || "Untitled") : "");
  let releaseYear = $derived(currentItem ? (currentItem.release_date || currentItem.first_air_date || "").split("-")[0] : "");
  let description = $derived(currentItem ? (currentItem.overview || "No description available.") : "");
  let posterPath = $derived(currentItem && currentItem.backdrop_path ? `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}` : null);
  let trailerKey = $derived(currentItem ? trailers[currentItem.id] : null);
  let rating = $derived(currentItem ? currentItem.vote_average?.toFixed(1) || "N/A" : "N/A");
  let isTV = $derived(currentItem ? currentItem.media_type === "tv" : false);
  let href = $derived(currentItem ? (isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`) : "");
</script>

{#if isLoading}
  <div class="relative w-full h-[100svh] bg-background overflow-hidden">
    <div class="absolute inset-0 bg-muted animate-pulse" />
  </div>
{:else if spotlights.length === 0}
  <div class="bg-background text-foreground p-10">No content available</div>
{:else}
  <div class="relative w-full h-[100svh] overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
    <!-- BACKGROUND TRAILER OR IMAGE -->
    <div class="absolute inset-0 z-0">
      {#if posterPath && !showTrailer}
        <img
          src={posterPath}
          alt={title}
          class="object-cover w-full h-full transition-opacity duration-1000 opacity-60"
        />
      {/if}

      <!-- Gradients -->
      <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
      <div class="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent z-10" />

      {#if trailerKey && !isMobile && showTrailer}
        <div class="absolute inset-0 transition-opacity duration-1000 opacity-100">
          <iframe
            bind:this={videoRef}
            class="absolute w-full h-[140%] -top-[20%] pointer-events-none scale-110"
            src="https://www.youtube.com/embed/{trailerKey}?enablejsapi=1&autoplay=1&mute={isMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist={trailerKey}&vq=hd1080&rel=0&playsinline=1"
            allow="autoplay; encrypted-media"
            allowfullscreen
            title="Trailer"
          />
        </div>
      {/if}
    </div>

    <!-- CONTENT -->
    <div class="relative z-30 h-full flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-16 max-w-[2400px] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <!-- LEFT META -->
        <div class="md:col-span-8 lg:col-span-7 space-y-6 md:space-y-8 mb-6">
          <div class="space-y-6">
            <div class="flex flex-wrap items-center gap-3">
              <div class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border flex items-center gap-2 {isTV ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary-foreground border-secondary/20'}">
                {#if isTV}
                  <Tv size={14} /> Series
                {:else}
                  <Film size={14} /> Movie
                {/if}
              </div>

              <div class="px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider bg-foreground/5 border border-border text-muted-foreground flex items-center gap-2">
                <Calendar size={14} /> {releaseYear}
              </div>

              {#if rating !== "N/A"}
                <div class="px-3 py-1.5 rounded-md text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-1.5">
                  <Star size={14} class="fill-yellow-400" /> {rating}
                </div>
              {/if}
            </div>

            <h1 class="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-foreground drop-shadow-2xl">
              {title}
            </h1>

            <p class="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed line-clamp-3 font-medium">
              {description}
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href={href}>
                <button class="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold tracking-tight hover:scale-105 hover:opacity-90 transition-all duration-300 shadow-lg cursor-pointer">
                  <Play size={20} class="fill-primary-foreground" /> Play Now
                </button>
              </a>
              <a href={href}>
                <button class="px-6 py-3.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border backdrop-blur-md transition-colors font-medium text-foreground flex items-center gap-2 cursor-pointer">
                  <Info size={20} /> More Info
                </button>
              </a>
            </div>
          </div>
        </div>

        <!-- RIGHT NAVIGATION & CONTROLS -->
        <div class="md:col-span-4 lg:col-span-5 flex flex-col items-end justify-end space-y-4">
          <div class="flex items-center gap-3">
            <div class="bg-card/40 backdrop-blur-xl border border-border rounded-2xl px-5 h-14 flex flex-col justify-center min-w-[100px] relative overflow-hidden">
              <span class="font-mono text-sm font-medium tracking-widest text-muted-foreground">
                <span class="text-foreground text-lg">{String(currentSlide + 1).padStart(2, "0")}</span>
                <span class="opacity-50 mx-1">/</span>
                {String(spotlights.length).padStart(2, "0")}
              </span>
            </div>

            <div class="h-14 bg-card/40 backdrop-blur-xl border border-border rounded-2xl flex items-center p-1 gap-1">
              <button
                onclick={handlePrevSlide}
                class="w-12 h-full flex items-center justify-center rounded-xl hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <ArrowRight size={20} class="rotate-180" />
              </button>
              <div class="w-[1px] h-6 bg-border" />
              <button
                onclick={togglePause}
                class="w-12 h-full flex items-center justify-center rounded-xl hover:bg-foreground/10 text-foreground transition-all cursor-pointer"
              >
                {#if isPaused}
                  <Play size={20} />
                {:else}
                  <Pause size={20} />
                {/if}
              </button>
              <div class="w-[1px] h-6 bg-border" />
              <button
                onclick={handleNextSlide}
                class="w-12 h-full flex items-center justify-center rounded-xl hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {#if trailerKey && !isMobile}
            <button
              onclick={toggleMute}
              class="w-10 h-10 flex items-center justify-center rounded-full bg-card/20 hover:bg-card/60 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              {#if isMuted}
                <VolumeX size={16} />
              {:else}
                <Volume2 size={16} />
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

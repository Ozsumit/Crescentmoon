<script>
  import { onMount } from "svelte";
  import { Mail, Clapperboard, PlayCircle, Globe, Link, Cpu } from "lucide-svelte";
  import FeedbackFormCore from "./FeedbackFormCore.svelte";

  let movieOfTheDay = $state(null);
  let currentYear = new Date().getFullYear();

  onMount(async () => {
    try {
      const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
      const resp = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`
      );

      if (resp.ok) {
        const data = await resp.json();
        const movies = data.results || [];
        if (movies.length > 0) {
          movieOfTheDay = movies[Math.floor(Math.random() * movies.length)];
        }
      }
    } catch (error) {
      console.error("Failed to fetch movie of the day in footer:", error);
    }
  });

  const footerSections = [
    {
      title: "Discover",
      links: [
        { label: "Now Playing", href: "/#movies" },
        { label: "Trending TV", href: "/#series" },
        { label: "Top Rated", href: "/#top-rated" },
        { label: "Upcoming", href: "/#upcoming" },
      ],
    },
    {
      title: "Studio",
      links: [
        { label: "About Crescent", href: "/about" },
        { label: "The Team", href: "/team" },
        { label: "Careers", href: "/careers" },
        { label: "Press Kit", href: "/press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Terms of Use", href: "/legal/terms" },
        { label: "Cookie Policy", href: "/legal/cookies" },
      ],
    },
  ];
</script>

<footer class="w-full bg-card text-foreground border-t border-border mt-20 relative overflow-hidden">
  <!-- Massive Background Brand Text (Subtle) -->
  <div class="absolute bottom-[-5vw] z-0 left-0 w-full select-none pointer-events-none opacity-[0.05] overflow-hidden leading-none">
    <h1 class="text-[25vw] font-black tracking-tighter text-foreground whitespace-nowrap">
      CRESCENT
    </h1>
  </div>

  <div class="max-w-[1600px] mx-auto relative z-10">
    <!-- --- ROW 1: BRAND & FEEDBACK --- -->
    <div class="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
      <!-- Brand Identity -->
      <div class="p-8 md:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between h-full">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <span class="font-black text-xl">C</span>
            </div>
            <span class="text-xl font-bold tracking-tight text-foreground">
              Crescent Moon
            </span>
          </div>
          <h2 class="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1] max-w-md">
            The new standard for{" "}
            <span class="text-muted-foreground">digital cinema</span>{" "}
            exploration.
          </h2>
        </div>
      </div>

      <!-- Inline Developer Feedback Form -->
      <div class="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-foreground/[0.01]">
        <FeedbackFormCore />
      </div>
    </div>

    <!-- --- ROW 2: LINKS & MOVIE PICK --- -->
    <div class="grid grid-cols-1 md:grid-cols-12">
      <!-- Navigation Links -->
      <div class="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 border-b md:border-b-0 md:border-r border-border">
        {#each footerSections as section}
          <div class="p-8 md:p-12 border-r border-border last:border-r-0">
            <h3 class="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
              {section.title}
            </h3>
            <ul class="space-y-4">
              {#each section.links as link}
                <li>
                  <a
                    href={link.href}
                    class="block text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>

      <!-- Movie of the Day -->
      <div class="md:col-span-4 p-8 md:p-12 flex flex-col bg-transparent justify-between min-h-[300px] relative group overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
              <Clapperboard size={14} />
              <span>Curator's Pick</span>
            </div>
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>

          {#if movieOfTheDay}
            <a href="/movie/{movieOfTheDay.id}" class="block">
              <h4 class="text-2xl font-bold leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4 decoration-border">
                {movieOfTheDay.title}
              </h4>
              <p class="text-sm text-muted-foreground line-clamp-3 mb-6 font-medium">
                {movieOfTheDay.overview}
              </p>
              <div class="inline-flex items-center gap-2 text-sm font-bold border-b border-foreground pb-0.5">
                <PlayCircle size={16} />
                Watch Trailer
              </div>
            </a>
          {:else}
            <div class="animate-pulse bg-muted w-full h-32 rounded-lg" />
          {/if}
        </div>
      </div>
    </div>

    <!-- --- ROW 3: FOOTER BOTTOM --- -->
    <div class="border-t border-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="text-xs text-muted-foreground font-mono">
        © {currentYear} VASS INC. / OMEGA
      </div>
      <div class="flex items-center gap-6">
        <a href="#" class="text-muted-foreground hover:text-foreground transition-colors hover:-translate-y-1 duration-300">
          <Globe size={20} />
        </a>
        <a href="#" class="text-muted-foreground hover:text-foreground transition-colors hover:-translate-y-1 duration-300">
          <Link size={20} />
        </a>
        <a href="#" class="text-muted-foreground hover:text-foreground transition-colors hover:-translate-y-1 duration-300">
          <Cpu size={20} />
        </a>
        <a href="#" class="text-muted-foreground hover:text-foreground transition-colors hover:-translate-y-1 duration-300">
          <Mail size={20} />
        </a>
      </div>
    </div>
  </div>
</footer>

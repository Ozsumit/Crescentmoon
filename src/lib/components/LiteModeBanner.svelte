<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let isVisible = $state(false);
  let liteUrl = $state("https://cmoonlite.sumit.info.np");

  $effect(() => {
    // Dynamically update based on active page route
    const currentPath = $page.url.pathname + $page.url.search;
    liteUrl = `https://cmoonlite.sumit.info.np${currentPath}`;
  });

  onMount(() => {
    const isDismissed = localStorage.getItem("lite-banner-dismissed");
    if (!isDismissed) {
      isVisible = true;
    }
  });

  function handleDismiss() {
    localStorage.setItem("lite-banner-dismissed", "true");
    isVisible = false;
  }
</script>

{#if isVisible}
  <div class="bg-primary/10 border-primary/20 sticky top-0 left-0 right-0 z-[101] border-b transition-all duration-300 text-primary text-xs md:text-sm py-2 px-4 flex justify-between items-center gap-2 backdrop-blur-md">
    <div class="w-full text-center">
      <span class="opacity-80">Page lagging too much? </span>
      <a
        href={liteUrl}
        class="underline font-bold hover:opacity-80 transition-colors ml-1"
      >
        Switch to Lite Mode
      </a>
    </div>
    <button
      onclick={handleDismiss}
      class="text-primary hover:opacity-70 focus:outline-none px-1 font-bold"
      aria-label="Dismiss banner"
    >
      ✕
    </button>
  </div>
{/if}

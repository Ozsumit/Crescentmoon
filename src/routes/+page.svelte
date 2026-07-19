<script>
  import SpotlightCarousel from "$lib/components/SpotlightCarousel.svelte";
  import TopTen from "$lib/components/TopTen.svelte";
  import HomeDisplay from "$lib/components/HomeDisplay.svelte";
  import AdblockerModal from "$lib/components/AdblockerModal.svelte";

  let { data } = $props();
  let trendingData = $derived(data.trending || []);
</script>

<div class="m-0 bg-background text-foreground h-auto">
  <SpotlightCarousel />
  <TopTen />
  <div class="w-full flex px-0 sm:px-4 justify-center items-center">
    <HomeDisplay initialData={trendingData} />
  </div>
  <AdblockerModal />
</div>

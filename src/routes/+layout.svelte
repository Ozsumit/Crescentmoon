<script>
  import "./layout.css";
  import ThemeWrapper from "$lib/components/ThemeWrapper.svelte";
  import SplashScreen from "$lib/components/SplashScreen.svelte";
  import Header from "$lib/components/Header.svelte";
  import CookieConsent from "$lib/components/CookieConsent.svelte";
  import PopupDeveloperFeedback from "$lib/components/PopupDeveloperFeedback.svelte";
  import Footer from "$lib/components/Footer.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>Cmoon - Watch Movies & TV Shows Online</title>
  <meta name="description" content="Stream movies and TV shows online in HD quality on Cmoon. Fast, responsive and entertainment-focused streaming platform." />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
</svelte:head>

<ThemeWrapper>
  <SplashScreen />
  <Header />

  <main class="pt-20 md:pt-24 min-h-[70vh]">
    {@render children()}
  </main>

  <CookieConsent />
  <PopupDeveloperFeedback />
  <Footer />
</ThemeWrapper>

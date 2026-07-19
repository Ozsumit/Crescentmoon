<script>
  import { onMount } from "svelte";

  let showConsent = $state(false);

  onMount(() => {
    const localConsent = localStorage.getItem("cookieConsent");
    if (!localConsent) {
      showConsent = true;
    }
  });

  function acceptCookies() {
    showConsent = false;
    localStorage.setItem("cookieConsent", "true");
  }

  function declineCookies() {
    showConsent = false;
    localStorage.setItem("cookieConsent", "false");
  }
</script>

{#if showConsent}
  <div class="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:max-w-md z-[100] animate-slide-up">
    <div class="bg-card border-2 border-border rounded-[2.5rem] shadow-2xl backdrop-blur-xl p-8 flex flex-col gap-6">
      <div class="flex items-start justify-between">
        <h2 class="text-4xl font-black uppercase tracking-tighter leading-none text-foreground">
          Cookie
          <br />
          Policy.
        </h2>
        <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-black text-xl select-none">
          +
        </div>
      </div>

      <p class="text-muted-foreground font-medium leading-relaxed text-sm sm:text-base">
        We use cookies to ensure you get the best experience on our website.
        Analytics, functionality, and performance.{" "}
        <a
          href="/privacy-policy"
          class="inline-block text-foreground font-black underline decoration-2 underline-offset-4 hover:text-primary transition-colors px-1 -ml-1"
        >
          Read the rules
        </a>
        .
      </p>

      <div class="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onclick={acceptCookies}
          class="flex-1 bg-primary text-primary-foreground border-2 border-primary rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all active:translate-y-1 active:shadow-none cursor-pointer"
        >
          Accept
        </button>

        <button
          onclick={declineCookies}
          class="flex-1 bg-transparent text-foreground border-2 border-border rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-widest hover:bg-muted transition-all active:translate-y-1 active:shadow-none cursor-pointer"
        >
          Decline
        </button>
      </div>
    </div>
  </div>
{/if}

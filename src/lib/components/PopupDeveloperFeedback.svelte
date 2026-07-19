<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { X } from "lucide-svelte";
  import { settingsStore } from "$lib/stores";
  import { FEEDBACK_THEMES } from "$lib/feedback-themes";
  import FeedbackFormCore from "./FeedbackFormCore.svelte";

  let isVisible = $state(false);

  onMount(() => {
    const lastDismissed = localStorage.getItem("feedback_dismissed");
    const feedbackSubmitted = localStorage.getItem("feedback_submitted");

    if (feedbackSubmitted) return;
    if (lastDismissed) {
      const oneDayInMs = 72 * 60 * 60 * 1000;
      if (Date.now() - parseInt(lastDismissed) < oneDayInMs) return;
    }

    const timer = setTimeout(() => (isVisible = true), 15000);
    return () => clearTimeout(timer);
  });

  function handleDismiss() {
    isVisible = false;
    localStorage.setItem("feedback_dismissed", Date.now().toString());
  }

  let theme = $derived(FEEDBACK_THEMES[$settingsStore.feedbackTheme] || FEEDBACK_THEMES.classic);
</script>

{#if isVisible && $settingsStore.showFeedbackPopup}
  <div
    transition:fly={{ y: 100, duration: 500 }}
    class="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:right-8 z-[9999] sm:max-w-md w-11/12"
  >
    <div class="{theme.bg} border-4 {theme.border} rounded-[2rem] p-6 sm:p-8 flex flex-col gap-6 relative transition-colors duration-500 shadow-2xl">
      <!-- Header Area -->
      <div class="flex items-start justify-between">
        <h2 class="text-3xl font-black uppercase tracking-tighter leading-none {theme.text}">
          Feedback
          <br />
          Loop.
        </h2>
        <button
          onclick={handleDismiss}
          class="w-10 h-10 flex items-center justify-center {theme.accent} {theme.accentText} rounded-full hover:opacity-80 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <FeedbackFormCore
        isPopup={true}
        onSuccessfulSubmit={() => {
          setTimeout(() => (isVisible = false), 3000);
        }}
      />
    </div>
  </div>
{/if}

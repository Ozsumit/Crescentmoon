<script>
  import { settingsStore } from "$lib/stores";
  import { FEEDBACK_THEMES } from "$lib/feedback-themes";
  import { Star, Bug, Lightbulb, CheckCircle2, Send } from "lucide-svelte";

  let { isPopup = false, onSuccessfulSubmit } = $props();

  let theme = $derived(FEEDBACK_THEMES[$settingsStore.feedbackTheme] || FEEDBACK_THEMES.classic);

  let isSubmitting = $state(false);
  let success = $state(false);
  let formData = $state({
    type: "review",
    rating: 5,
    message: "",
    email: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.message.trim()) return;

    isSubmitting = true;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        success = true;
        localStorage.setItem("feedback_submitted", "true");
        if (onSuccessfulSubmit) onSuccessfulSubmit();

        setTimeout(() => {
          success = false;
          formData = { type: "review", rating: 5, message: "", email: "" };
        }, 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSubmitting = false;
    }
  }

  let pulseDotClass = $derived(isPopup ? theme.pulse : "bg-primary/20");
  let successContainerClass = $derived(
    isPopup
      ? "flex flex-col items-center justify-center py-8 sm:py-10 text-center"
      : "flex flex-col items-center justify-center py-8 sm:py-10 text-center border border-border rounded-2xl bg-foreground/5"
  );
  let submitBtnClass = $derived(
    isPopup
      ? `${theme.accent} ${theme.accentText} shadow-[0_0_15px_rgba(255,255,255,0.2)]`
      : "bg-primary text-primary-foreground hover:opacity-90"
  );
</script>

<h3 class="text-[11px] sm:text-xs font-mono uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 {isPopup ? theme.text : 'text-muted-foreground'}">
  <span class="w-2 h-2 rounded-full animate-pulse {pulseDotClass}"></span>
  Developer Uplink
</h3>

<div class="relative">
  {#if success}
    <div class={successContainerClass}>
      <div class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 sm:mb-4">
        <CheckCircle2 size={24} class="text-primary" />
      </div>
      <h3 class="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider mb-1">
        Transmission Sent
      </h3>
      <p class="text-[11px] sm:text-xs text-muted-foreground">
        Thank you. The developer has received your logs.
      </p>
    </div>
  {:else}
    <form onsubmit={handleSubmit} class="flex flex-col gap-3 sm:gap-4">
      <!-- Type Selector -->
      <div class="flex gap-1.5 sm:gap-2 w-full">
        <button
          type="button"
          onclick={() => (formData.type = 'review')}
          class="relative px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 flex-1 justify-center overflow-hidden border min-h-[44px] sm:min-h-0 {formData.type === 'review' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent text-muted-foreground hover:bg-foreground/5'}"
        >
          <Star size={14} class="shrink-0" /> Review
        </button>
        <button
          type="button"
          onclick={() => (formData.type = 'bug')}
          class="relative px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 flex-1 justify-center overflow-hidden border min-h-[44px] sm:min-h-0 {formData.type === 'bug' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent text-muted-foreground hover:bg-foreground/5'}"
        >
          <Bug size={14} class="shrink-0" /> Bug
        </button>
        <button
          type="button"
          onclick={() => (formData.type = 'feature')}
          class="relative px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 flex-1 justify-center overflow-hidden border min-h-[44px] sm:min-h-0 {formData.type === 'feature' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent text-muted-foreground hover:bg-foreground/5'}"
        >
          <Lightbulb size={14} class="shrink-0" /> Idea
        </button>
      </div>

      <!-- Rating Selector (if Review) -->
      {#if formData.type === 'review'}
        <div class="flex flex-col items-start gap-1 overflow-hidden">
          <div class="flex gap-1 bg-foreground/5 p-1 rounded-xl border border-border">
            {#each [1, 2, 3, 4, 5] as star}
              <button
                type="button"
                onclick={() => (formData.rating = star)}
                class="p-2 sm:p-1.5 rounded-lg transition-all {formData.rating >= star ? 'text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}"
              >
                <Star size={18} class={formData.rating >= star ? 'fill-current' : ''} />
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Text Inputs -->
      <div class="flex flex-col gap-2">
        <textarea
          required
          rows="3"
          placeholder="Describe your issue or feedback..."
          bind:value={formData.message}
          class="w-full bg-foreground/5 border border-border rounded-xl p-3 sm:p-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:bg-foreground/10 transition-all resize-none focus:border-primary/40"
        ></textarea>

        <div class="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="email"
            placeholder="Email (optional)"
            bind:value={formData.email}
            class="flex-1 min-h-[44px] sm:min-h-0 bg-foreground/5 border border-border rounded-xl p-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:bg-foreground/10 transition-all focus:border-primary/40"
          />
          <button
            type="submit"
            disabled={isSubmitting || !formData.message.trim()}
            class="min-h-[44px] sm:min-h-0 py-3 sm:py-0 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all shrink-0 cursor-pointer {isSubmitting || !formData.message.trim() ? 'bg-foreground/5 text-muted-foreground cursor-not-allowed' : submitBtnClass}"
          >
            {#if isSubmitting}
              <div class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            {:else}
              <Send size={16} />
              <span class="sm:hidden">Send</span>
            {/if}
          </button>
        </div>
      </div>
    </form>
  {/if}
</div>

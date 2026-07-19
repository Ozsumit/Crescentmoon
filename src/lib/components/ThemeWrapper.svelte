<script>
  import { onMount } from "svelte";
  import { settingsStore } from "$lib/stores";
  import { SITE_THEMES } from "$lib/themes";

  let { children } = $props();

  let isHovering = $state(false);

  let currentTheme = $derived(
    $settingsStore.siteTheme === "custom"
      ? {
          name: "Custom",
          type: "dark",
          colors: {
            ...$settingsStore.customTheme,
            primaryForeground: "0 0% 100%",
            secondary: $settingsStore.customTheme.card,
            secondaryForeground: $settingsStore.customTheme.foreground,
            muted: $settingsStore.customTheme.card,
            mutedForeground: $settingsStore.customTheme.foreground,
            accentForeground: $settingsStore.customTheme.foreground,
            destructive: "0 84% 60%",
            destructiveForeground: "0 0% 100%",
            popover: $settingsStore.customTheme.background,
            popoverForeground: $settingsStore.customTheme.foreground,
            input: $settingsStore.customTheme.border,
            ring: $settingsStore.customTheme.primary,
          },
        }
      : SITE_THEMES[$settingsStore.siteTheme] || SITE_THEMES.space_gray
  );

  let accentColorValue = $derived($settingsStore.accentColor || `hsl(${currentTheme.colors.accent})`);
  let primaryColor = $derived(`hsl(${currentTheme.colors.primary})`);

  // Svg cursors
  let rawNormalSvg = $derived(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" stroke="${accentColorValue}" stroke-dasharray="3 2" stroke-opacity="0.6" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="14" stroke="${accentColorValue}" stroke-opacity="0.15" stroke-width="1"/>
      <circle cx="16" cy="16" r="3" fill="${accentColorValue}"/>
    </svg>
  `.trim());

  let rawHoverSvg = $derived(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="5" stroke="${primaryColor}" stroke-dasharray="1 1" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="15" stroke="${primaryColor}" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="16" cy="16" r="4.5" fill="${primaryColor}"/>
    </svg>
  `.trim());

  let normalCursorDataUri = $derived(`data:image/svg+xml,${encodeURIComponent(rawNormalSvg)}`);
  let hoverCursorDataUri = $derived(`data:image/svg+xml,${encodeURIComponent(rawHoverSvg)}`);

  onMount(() => {
    const handleMouseOver = (e) => {
      if (!$settingsStore.customCursor) return;
      const target = e.target;
      if (
        target &&
        target.closest(
          "a, button, .interactive-card, select, input, textarea, [role='button'], [type='submit']"
        )
      ) {
        isHovering = true;
      } else {
        isHovering = false;
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  });
</script>

<svelte:head>
  <style>
    :root {
      --background: {currentTheme.colors.background};
      --foreground: {currentTheme.colors.foreground};
      --card: {currentTheme.colors.card};
      --card-foreground: {currentTheme.colors.cardForeground};
      --popover: {currentTheme.colors.popover};
      --popover-foreground: {currentTheme.colors.popoverForeground};
      --primary: {currentTheme.colors.primary};
      --primary-foreground: {currentTheme.colors.primaryForeground};
      --secondary: {currentTheme.colors.secondary};
      --secondary-foreground: {currentTheme.colors.secondaryForeground};
      --muted: {currentTheme.colors.muted};
      --muted-foreground: {currentTheme.colors.mutedForeground};
      --accent: {currentTheme.colors.accent};
      --accent-foreground: {currentTheme.colors.accentForeground};
      --destructive: {currentTheme.colors.destructive};
      --destructive-foreground: {currentTheme.colors.destructiveForeground};
      --border: {currentTheme.colors.border};
      --input: {currentTheme.colors.input};
      --ring: {currentTheme.colors.ring};
      --accent-custom: {$settingsStore.accentColor || `hsl(${currentTheme.colors.accent})`};
      --radius: 1.5rem;
    }

    /* Cursor replacement styling */
    {#if $settingsStore.customCursor}
      @media (min-width: 768px) {
        html, body, main, div, p, span, section, h1, h2, h3, h4, h5, h6 {
          cursor: url("{normalCursorDataUri}") 16 16, auto !important;
        }

        a, button, select, input, textarea, [role='button'], .interactive-card,
        a *, button *, select *, input *, textarea *, [role='button'] *, .interactive-card * {
          cursor: url("{hoverCursorDataUri}") 16 16, pointer !important;
        }
      }
    {/if}

    body {
      background-color: hsl({currentTheme.colors.background}) !important;
      color: hsl({currentTheme.colors.foreground}) !important;
      transition: background-color 0.5s ease, color 0.5s ease;
    }

    .text-indigo-400,
    .text-indigo-500,
    .text-indigo-600 {
      color: var(--accent-custom) !important;
    }
    .bg-indigo-400,
    .bg-indigo-500,
    .bg-indigo-600 {
      background-color: var(--accent-custom) !important;
    }
    .border-indigo-400,
    .border-indigo-500,
    .border-indigo-600 {
      border-color: var(--accent-custom) !important;
    }
    .ring-indigo-500 {
      --tw-ring-color: var(--accent-custom) !important;
    }

    .shadow-indigo-600\/20 {
      --tw-shadow-color: color-mix(
        in srgb,
        var(--accent-custom),
        transparent 80%
      ) !important;
    }

    .bg-card {
      background-color: hsl(var(--card)) !important;
    }
    .text-card-foreground {
      color: hsl(var(--card-foreground)) !important;
    }
    .border-theme {
      border-color: hsl(var(--border)) !important;
    }
  </style>
</svelte:head>

<div
  class="relative min-h-screen transition-colors duration-700 {currentTheme.type === 'dark' ? 'dark' : ''}"
  style:--accent-color={$settingsStore.accentColor}
  style:background="hsl({currentTheme.colors.background})"
  style:color="hsl({currentTheme.colors.foreground})"
>
  {@render children()}
</div>

import { writable } from "svelte/store";

// Persistence helper
export function persisted(key, initialValue) {
  const store = writable(initialValue);

  if (typeof window !== "undefined") {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      try {
        store.set(JSON.parse(storedValue));
      } catch (e) {
        console.error(`Error loading persisted store: ${key}`, e);
      }
    }

    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}

// 1. Settings Store
export const settingsStore = persisted("cmoon-settings-storage-v2", {
  accentColor: "#6366f1",
  defaultMovieServer: "Server 1",
  defaultTvServer: "vidking",
  confirmRemove: true,
  showAdNotice: true,
  customCursor: false,
  showFeedbackPopup: true,
  feedbackTheme: "classic",
  siteTheme: "space_gray",
  customTheme: {
    background: "240 10% 3.9%",
    foreground: "0 0% 98%",
    card: "240 10% 3.9%",
    primary: "240 5.9% 10%",
    border: "240 3.7% 15.9%",
    accent: "240 4.8% 95.9%"
  }
});

// Helper actions for settings
export function resetSettings() {
  settingsStore.set({
    accentColor: "#6366f1",
    defaultMovieServer: "Server 1",
    defaultTvServer: "vidking",
    confirmRemove: true,
    showAdNotice: true,
    customCursor: false,
    showFeedbackPopup: true,
    feedbackTheme: "classic",
    siteTheme: "space_gray",
    customTheme: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      primary: "240 5.9% 10%",
      border: "240 3.7% 15.9%",
      accent: "240 4.8% 95.9%"
    }
  });
}

// 2. Genre / Providers Filter Store
export const genreFilterStore = persisted("genre-filter-storage", {
  activeGenres: [],
  activeProviders: []
});

// 3. Favorites Store
export const favoritesStore = persisted("favorites", []);

export function isFavorite(id, favorites) {
  return (favorites || []).some((fav) => fav.id === id);
}

export function addFavorite(item) {
  favoritesStore.update((prev) => {
    if (prev.some((fav) => fav.id === item.id)) return prev;
    return [...prev, item];
  });
}

export function removeFavorite(id) {
  favoritesStore.update((prev) => prev.filter((fav) => fav.id !== id));
}

// 4. Continue Watching / Media Progress Store
export const mediaProgressStore = persisted("mediaProgress", {});

export function updateMediaProgress(id, data) {
  mediaProgressStore.update((prev) => {
    const existing = prev[id] || {};
    return {
      ...prev,
      [id]: {
        ...existing,
        ...data,
        id,
        last_updated: Date.now()
      }
    };
  });
}

export function deleteMediaProgress(id) {
  mediaProgressStore.update((prev) => {
    const copy = { ...prev };
    delete copy[id];
    return copy;
  });
}

// 5. Snowfall and Lite mode toggles
export const showSnowStore = persisted("showSnow", false);
export const liteModeStore = persisted("liteMode", false);

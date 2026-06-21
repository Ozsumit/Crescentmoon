import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      accentColor: "#6366f1", // Default Indigo
      defaultMovieServer: "Server 1",
      defaultTvServer: "vidking",
      confirmRemove: true,
      showAdNotice: true,
      customCursor: true,
      showFeedbackPopup: true,
      feedbackTheme: "classic",

      setAccentColor: (color) => set({ accentColor: color }),
      setDefaultMovieServer: (server) => set({ defaultMovieServer: server }),
      setDefaultTvServer: (server) => set({ defaultTvServer: server }),
      setConfirmRemove: (confirm) => set({ confirmRemove: confirm }),
      setShowAdNotice: (show) => set({ showAdNotice: show }),
      setCustomCursor: (show) => set({ customCursor: show }),
      setShowFeedbackPopup: (show) => set({ showFeedbackPopup: show }),
      setFeedbackTheme: (theme) => set({ feedbackTheme: theme }),

      resetSettings: () => set({
        accentColor: "#6366f1",
        defaultMovieServer: "Server 1",
        defaultTvServer: "vidking",
        confirmRemove: true,
        showAdNotice: true,
        customCursor: true,
        showFeedbackPopup: true,
        feedbackTheme: "classic",
      }),
    }),
    {
      name: "cmoon-settings-storage",
    }
  )
);

export default useSettingsStore;

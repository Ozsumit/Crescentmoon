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

      setAccentColor: (color) => set({ accentColor: color }),
      setDefaultMovieServer: (server) => set({ defaultMovieServer: server }),
      setDefaultTvServer: (server) => set({ defaultTvServer: server }),
      setConfirmRemove: (confirm) => set({ confirmRemove: confirm }),
      setShowAdNotice: (show) => set({ showAdNotice: show }),
      setCustomCursor: (show) => set({ customCursor: show }),

      resetSettings: () => set({
        accentColor: "#6366f1",
        defaultMovieServer: "Server 1",
        defaultTvServer: "vidking",
        confirmRemove: true,
        showAdNotice: true,
        customCursor: true,
      }),
    }),
    {
      name: "cmoon-settings-storage",
    }
  )
);

export default useSettingsStore;

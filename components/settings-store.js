import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper to get the initial value from the existing local storage key
const getInitialMovieServer = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("defaultServerName") || "Server 1";
  }
  return "Server 1";
};

const getInitialTvServer = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("defaultTvServerName") || "server 1";
  }
  return "server 1";
};

const useSettingsStore = create(
  persist(
    (set) => ({
      accentColor: "#6366f1", // Default Indigo
      defaultMovieServer: getInitialMovieServer(),
      defaultTvServer: getInitialTvServer(),
      confirmRemove: true,
      showAdNotice: true,
      customCursor: false,
      showFeedbackPopup: true,
      feedbackTheme: "classic",
      siteTheme: "obsidian",

      setAccentColor: (color) => set({ accentColor: color }),

      setDefaultMovieServer: (server) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("defaultServerName", server);
        }
        set({ defaultMovieServer: server });
      },

      setDefaultTvServer: (server) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("defaultTvServerName", server);
        }
        set({ defaultTvServer: server });
      },

      setConfirmRemove: (confirm) => set({ confirmRemove: confirm }),
      setShowAdNotice: (show) => set({ showAdNotice: show }),
      setCustomCursor: (show) => set({ customCursor: show }),
      setShowFeedbackPopup: (show) => set({ showFeedbackPopup: show }),
      setFeedbackTheme: (theme) => set({ feedbackTheme: theme }),
      setSiteTheme: (theme) => set({ siteTheme: theme }),

      resetSettings: () => {
        const defaultMovieServer = "Server 1";
        const defaultTvServer = "server 1";

        if (typeof window !== "undefined") {
          localStorage.setItem("defaultServerName", defaultMovieServer);
          localStorage.setItem("defaultTvServerName", defaultTvServer);
        }

        set({
          accentColor: "#6366f1",
          defaultMovieServer: defaultMovieServer,
          defaultTvServer: defaultTvServer,
          confirmRemove: true,
          showAdNotice: true,
          customCursor: true,
          showFeedbackPopup: true,
          feedbackTheme: "classic",
          siteTheme: "obsidian",
        });
      },
    }),
    {
      name: "cmoon-settings-storage",
    },
  ),
);

export default useSettingsStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Create the Zustand store with persistence
const useGenreStore = create(
  persist(
    (set) => ({
      activeGenres: [],
      setActiveGenres: (genres) => set({ activeGenres: genres }),
      toggleGenre: (genre) =>
        set((state) => ({
          activeGenres: state.activeGenres.some((g) => g.id === genre.id)
            ? state.activeGenres.filter((g) => g.id !== genre.id)
            : [...state.activeGenres, genre],
        })),
      clearGenres: () => set({ activeGenres: [] }),

      activeProviders: [],
      toggleProvider: (providerId) =>
        set((state) => ({
          activeProviders: (state.activeProviders || []).includes(providerId)
            ? state.activeProviders.filter((id) => id !== providerId)
            : [...(state.activeProviders || []), providerId],
        })),
      clearProviders: () => set({ activeProviders: [] }),
    }),
    {
      name: "genre-filter-storage", // unique name for localStorage
      // Optional: specify which parts of the state to persist
      partialize: (state) => ({
        activeGenres: state.activeGenres,
        activeProviders: state.activeProviders
      }),
    }
  )
);

export default useGenreStore;

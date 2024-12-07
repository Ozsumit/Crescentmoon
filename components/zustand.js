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
    }),
    {
      name: "genre-filter-storage", // unique name for localStorage
      // Optional: specify which parts of the state to persist
      partialize: (state) => ({ activeGenres: state.activeGenres }),
    }
  )
);

export default useGenreStore;

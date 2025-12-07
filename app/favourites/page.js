"use client";

import React, { useEffect, useState } from "react";
import FavoriteDisplay from "@/components/display/favouriteDisplay";
// FIX: Added AnimatePresence to the import below
import { motion, AnimatePresence } from "framer-motion";

// --- DEFAULT DATA ---
const defaultMovies = [
  {
    id: 545611,
    title: "Everything Everywhere All at Once",
    poster_path: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    release_date: "2022-03-24",
    vote_average: 7.8,
    overview:
      "An aging Chinese immigrant is swept up in an insane adventure...",
  },
  {
    id: 640,
    title: "Catch Me If You Can",
    poster_path: "/sdYgEkKCDPWNU6KnoL4qd8xZ4w7.jpg",
    release_date: "2002-12-25",
    vote_average: 8.0,
    overview: "A true story about Frank Abagnale Jr...",
  },
  {
    id: 19913,
    title: "(500) Days of Summer",
    poster_path: "/f9mbM0YMLpYemcWx6o2WeiYQLDP.jpg",
    release_date: "2009-07-17",
    vote_average: 7.3,
    overview: "An offbeat romantic comedy...",
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    overview: "Framed in the 1940s...",
  },
  {
    id: 157336,
    title: "Interstellar",
    poster_path: "/9REO1DLpmwhrBJY3mYW5eVxkXFM.jpg",
    release_date: "2014-11-05",
    vote_average: 8.448,
    overview: "A team ventures into space...",
  },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DATA LOADING LOGIC ---
  useEffect(() => {
    try {
      setIsLoading(true);
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites(defaultMovies);
      }
    } catch (err) {
      setError("Failed to load favorites");
      setFavorites(defaultMovies);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedFavorites = localStorage.getItem("favorites");
        if (storedFavorites !== null) {
          setFavorites(JSON.parse(storedFavorites));
        } else {
          setFavorites(defaultMovies);
        }
      } catch (err) {
        setError("Failed to sync favorites");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleFavorite = (item) => {
    try {
      const isAlreadyFavorite = favorites.some((fav) => fav.id === item.id);
      let updatedFavorites;
      if (isAlreadyFavorite) {
        updatedFavorites = favorites.filter((fav) => fav.id !== item.id);
      } else {
        updatedFavorites = [...favorites, item];
      }
      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setError(null);
    } catch (err) {
      setError("Failed to update favorites");
    }
  };

  const filteredFavorites = favorites.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "series")
      return item.first_air_date || item.media_type === "tv";
    if (activeTab === "movies")
      return item.release_date || item.media_type === "movie";
    return true;
  });

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-1 bg-white/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-1/2 h-full bg-indigo-500"
            />
          </div>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            Loading_Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-neutral-950 text-white relative selection:bg-indigo-500/30">
      {/* Background Texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-[2000px]">
        {/* --- PAGE HEADER (Swiss Style) --- */}
        <header className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2"
            >
              ARCHIVE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base font-mono text-neutral-500 uppercase tracking-widest"
            >
              Personal Collection • {favorites.length} Items
            </motion.p>
          </div>

          {/* Stats Tiles (Material Cards) */}
          <div className="flex gap-4">
            {[
              {
                label: "Movies",
                count: favorites.filter((i) => i.release_date).length,
                color: "text-indigo-400",
              },
              {
                label: "Series",
                count: favorites.filter((i) => i.first_air_date).length,
                color: "text-rose-400",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="px-5 py-3 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm"
              >
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.count}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </header>

        {/* --- ERROR MESSAGE --- */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-center">
                <p className="text-red-400 font-mono text-sm">ERROR: {error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MAIN DISPLAY COMPONENT --- */}
        <FavoriteDisplay
          filteredFavorites={filteredFavorites}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          toggleFavorite={toggleFavorite}
        />

        {/* --- FOOTER --- */}
        <footer className="mt-20 border-t border-white/5 pt-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
            <span>Database_Version: 2.4.0</span>
            <span>Last_Sync: {new Date().toLocaleDateString()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Favorites;

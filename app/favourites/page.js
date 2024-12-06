"use client";
import React, { useEffect, useState } from "react";
import FavoriteCard from "@/components/display/favouritecARD";
import FavTitle from "@/components/title/fav";
import { FavoritesProvider } from "@/components/favourites";
import FavoriteDisplay from "@/components/display/favouriteDisplay";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  // Update favorites when localStorage changes (e.g., in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      setFavorites(storedFavorites);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Filter favorites based on active tab
  const filteredFavorites = favorites.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "series") return item.first_air_date;
    if (activeTab === "movies") return item.release_date;
    if (activeTab === "episodes") return item.episode_number;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br justify-center items-center from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto mt-4 px-4 py-8 flex-grow">
        {/* <FavTitle /> */}

        {/* Tab Navigation */}

        {/* Favorites Results */}
        <div className="mt-8">
          {filteredFavorites.length > 0 ? (
            // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <FavoriteDisplay />
          ) : (
            // </div>
            <div className="text-center text-slate-400 py-12">
              <p>No favorites yet! Start adding some.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;

import React, { useState, useEffect } from "react";
import FavoriteCard from "./favouritecARD";

const FavoriteDisplay = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // Load favorites from localStorage on component mount
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
    if (activeTab === "series") return item.first_air_date; // Series have `first_air_date`
    if (activeTab === "movies") return item.release_date; // Movies have `release_date`
    return true;
  });

  return (
    <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl">
      <div className="flex place-content-center mt-5 mb-8 mx-5">
        <h1 className="w-full md:w-1/2 lg:w-1/3 text-white text-xl sm:text-2xl md:text-3xl text-center font-semibold">
          Your
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
            {" "}
            Favorites
          </span>
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex bg-slate-800 rounded-full p-1 space-x-1">
          {["all", "series", "movies"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata Divider */}
      <div className="w-full flex justify-center mt-4 mb-8">
        <span className="w-4/5 bg-slate-600 h-0.5"></span>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite, index) => (
            <FavoriteCard key={favorite.id || index} favoriteItem={favorite} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-12">
          No favorites found. Start adding some!
        </div>
      )}
    </div>
  );
};

export default FavoriteDisplay;

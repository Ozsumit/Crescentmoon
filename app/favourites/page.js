"use client";
import React, { useEffect, useState } from "react";
import HomeCards from "/components/display/HomeCard";
import FavTitle from "@/components/title/fav";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <FavTitle />
        <div className="flex flex-wrap justify-center">
          {favorites.length > 0 ? (
            favorites.map((movie) => (
              <HomeCards key={movie.id} MovieCard={movie} />
            ))
          ) : (
            <p className="text-center text-slate-400">
              No favorites yet! Start adding some.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;

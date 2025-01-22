"use client";
import React, { useEffect, useState } from "react";
import FavoriteCard from "@/components/display/favouritecARD";
import FavTitle from "@/components/title/fav";
import { FavoritesProvider } from "@/components/favourites";
import FavoriteDisplay from "@/components/display/favouriteDisplay";

const defaultMovies = [
  {
    id: 1184918,
    title: "The Wild Robot",
    poster_path: "/1pmXyN3sKeYoUhu5VBZiDU4BX21.jpg",
    release_date: "2024-09-12",
    vote_average: 8.378,
    overview: "An adventurous journey of a robot in a futuristic wild setting.",
  },
  {
    id: 149870,
    title: "The Wind Rises",
    poster_path: "/zZiflZpuaZerugtfdyXcg6dcylD.jpg",
    release_date: "2013-07-20",
    vote_average: 7.8,
    overview:
      "A love story and the passion for flying, set during a turbulent historical era.",
  },
  {
    id: 12429,
    title: "Ponyo",
    poster_path: "/shqLeIkqPAAXM8iT6wVDiXUYz1p.jpg",
    release_date: "2008-07-19",
    vote_average: 7.7,
    overview:
      "A magical fish befriends a boy, embarking on a journey filled with wonder.",
  },
  {
    id: 81,
    title: "Nausicaä of the Valley of the Wind",
    poster_path: "/ulVUa2MvnJAjAeRt7h23FFJVRKH.jpg",
    release_date: "1984-03-11",
    vote_average: 7.9,
    overview:
      "A brave princess fights to protect her home and discover harmony in a desolate world.",
  },
  {
    id: 10515,
    title: "Castle in the Sky",
    poster_path: "/z6OZ2Q4FYELeGoBj9tVDWCvevkj.jpg",
    release_date: "1986-08-02",
    vote_average: 7.976,
    overview:
      "A quest to uncover a legendary flying city while avoiding adversaries.",
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    poster_path: "/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg",
    release_date: "1994-09-23",
    vote_average: 8.708,
    overview:
      "The inspiring story of hope and friendship within the confines of a prison.",
  },
  {
    id: 14160,
    title: "Up",
    poster_path: "/hGGC9gKo7CFE3fW07RA587e5kol.jpg",
    release_date: "2009-05-28",
    vote_average: 7.958,
    overview:
      "An elderly man and a young boy embark on an adventure in a house lifted by balloons.",
  },
  {
    id: 10681,
    title: "WALL·E",
    poster_path: "/fK5ssgvtI43z19FoWigdlqgpLRE.jpg",
    release_date: "2008-06-22",
    vote_average: 8.1,
    overview:
      "A lone robot on Earth discovers love and purpose while cleaning up waste.",
  },
  {
    id: 823219,
    title: "Flow",
    poster_path: "/b3mdmjYTEL70j7nuXATUAD9qgu4.jpg",
    release_date: "2024-01-30",
    vote_average: 8.4,
    overview:
      "An animated journey through surreal landscapes of adventure and discovery.",
  },
  {
    id: 315162,
    title: "Puss in Boots: The Last Wish",
    poster_path: "/jr8tSoJGj33XLgFBy6lmZhpGQNu.jpg",
    release_date: "2022-12-07",
    vote_average: 8.2,
    overview:
      "A daring feline hero embarks on a quest to restore his nine lives.",
  },
  {
    id: 27205,
    title: "Inception",
    poster_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    release_date: "2010-07-15",
    vote_average: 8.37,
    overview:
      "A thief uses dream-sharing technology to plant an idea in a corporate target.",
  },
  {
    id: 157336,
    title: "Interstellar",
    poster_path: "/9REO1DLpmwhrBJY3mYW5eVxkXFM.jpg",
    release_date: "2014-11-05",
    vote_average: 8.448,
    overview: "A team ventures into space to ensure humanity's survival.",
  },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites"));
    if (storedFavorites && storedFavorites.length > 0) {
      setFavorites(storedFavorites);
    } else {
      // Set default movies if no favorites are found
      setFavorites(defaultMovies);
      setLocalStorageItem("favorites", defaultMovies);
    }
  }, []);

  // Update favorites when localStorage changes (e.g., in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFavorites = JSON.parse(localStorage.getItem("favorites"));
      if (storedFavorites && storedFavorites.length > 0) {
        setFavorites(storedFavorites);
      } else {
        setFavorites(defaultMovies);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Function to update favorites and sync with local storage and database
  const updateFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    setLocalStorageItem("favorites", newFavorites);
    // Sync with database (replace with your actual API call)
    syncFavoritesWithDatabase(newFavorites);
  };

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
        <div className="mt-8">
          {filteredFavorites.length > 0 ? (
            <FavoriteDisplay />
          ) : (
            <div className="text-center text-slate-400 py-12">
              <p>Something went wrong loading favorites.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to sync favorites with the database
const syncFavoritesWithDatabase = async (favorites) => {
  try {
    const response = await fetch("/api/syncFavorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ favorites }),
    });
    if (!response.ok) {
      throw new Error("Failed to sync favorites with the database");
    }
  } catch (error) {
    console.error("Error syncing favorites with the database:", error);
  }
};

export default Favorites;

"use client";
import React, { useEffect, useState } from "react";
import FavoriteDisplay from "@/components/display/favouriteDisplay";

const defaultMovies = [
  {
    id: 545611,
    title: "Everything Everywhere All at Once",
    poster_path: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    release_date: "2022-03-24",
    vote_average: 7.8,
    overview:
      "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.",
  },
  {
    id: 640,
    title: "Catch Me If You Can",
    poster_path:
      "https://image.tmdb.org/t/p/w500/sdYgEkKCDPWNU6KnoL4qd8xZ4w7.jpg",
    release_date: "2002-12-25",
    vote_average: 8.0,
    overview:
      "A true story about Frank Abagnale Jr., who, before his 19th birthday, successfully performed cons worth millions of dollars by posing as a Pan Am pilot, a doctor, and a legal prosecutor.",
  },
  {
    id: 19913,
    title: "(500) Days of Summer",
    poster_path: "/f9mbM0YMLpYemcWx6o2WeiYQLDP.jpg",
    release_date: "2009-07-17",
    vote_average: 7.3,
    overview:
      "An offbeat romantic comedy about a woman who doesn't believe true love exists, and the young man who falls for her.",
  },
  {
    id: 8363,
    title: "Superbad",
    poster_path: "/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg",
    release_date: "2007-08-17",
    vote_average: 7.2,
    overview:
      "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.",
  },
  {
    id: 13,
    title: "Forrest Gump",
    poster_path: "/h5J4W4veyxMXDMjeNxZI46TsHOb.jpg",
    release_date: "1994-07-06",
    vote_average: 8.5,
    overview:
      "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
  },
  {
    id: 4951,
    title: "10 Things I Hate About You",
    poster_path:
      "https://image.tmdb.org/t/p/w500/ujERk3aKABXU3NDXOAxEQYTHe9A.jpg",
    release_date: "1999-03-30",
    vote_average: 7.5,
    overview:
      "A pretty, popular teenager can't go out on a date until her ill-tempered older sister does.",
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    overview:
      "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
  },
  {
    id: 106646,
    title: "The Wolf of Wall Street",
    poster_path: "/pWHf4khOloNVfCxscsXFj3jj6gP.jpg",
    release_date: "2013-12-25",
    vote_average: 8.0,
    overview:
      "A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street, corporate banking world and mob infiltration.",
  },
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
  // {
  //   id: 278,
  //   title: "The Shawshank Redemption",
  //   poster_path: "/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg",
  //   release_date: "1994-09-23",
  //   vote_average: 8.708,
  //   overview:
  //     "The inspiring story of hope and friendship within the confines of a prison.",
  // },
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

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites !== null) {
      // Load existing favorites (even if empty array)
      setFavorites(JSON.parse(storedFavorites));
    } else {
      // Show defaults only if no 'favorites' key exists
      setFavorites(defaultMovies);
    }
  }, []);

  // Sync between tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        // Only show defaults if key is completely removed
        setFavorites(defaultMovies);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Add or remove favorites
  const toggleFavorite = (item) => {
    const isAlreadyFavorite = favorites.some((fav) => fav.id === item.id);

    let updatedFavorites;
    if (isAlreadyFavorite) {
      // Remove the item
      updatedFavorites = favorites.filter((fav) => fav.id !== item.id);
    } else {
      // Add the item
      updatedFavorites = [...favorites, item];
    }

    // Update state and localStorage
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Filter logic
  const filteredFavorites = favorites.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "series") return item.first_air_date;
    if (activeTab === "movies") return item.release_date;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br justify-center items-center from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto mt-4 px-4 py-8 flex-grow">
        <div className="mt-8">
          <FavoriteDisplay
            filteredFavorites={filteredFavorites}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  );
};

export default Favorites;

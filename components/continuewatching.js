"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Tag } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Genre color mapping
const GENRE_COLORS = {
  // Action genres
  Action: "bg-red-600/20 text-red-400",
  Adventure: "bg-orange-600/20 text-orange-400",

  // Drama and emotional genres
  Drama: "bg-purple-600/20 text-purple-400",
  Romance: "bg-pink-600/20 text-pink-400",

  // Sci-Fi and Fantasy
  "Science Fiction": "bg-blue-600/20 text-blue-400",
  Fantasy: "bg-indigo-600/20 text-indigo-400",

  // Comedy and light genres
  Comedy: "bg-green-600/20 text-green-400",
  Animation: "bg-lime-600/20 text-lime-500",

  // Thriller and Dark genres
  Thriller: "bg-gray-600/20 text-gray-400",
  Horror: "bg-black/40 text-red-500",

  // Other genres
  Documentary: "bg-yellow-600/20 text-yellow-400",
  Mystery: "bg-teal-600/20 text-teal-400",
  War: "bg-stone-600/20 text-stone-400",
  Crime: "bg-zinc-600/20 text-zinc-400",
  Family: "bg-emerald-600/20 text-emerald-400",
  Music: "bg-rose-600/20 text-rose-400",
  History: "bg-amber-600/20 text-amber-400",
};

// Fetch movie details from TMDB
const fetchMovieDetails = async (movieId) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch movie details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

// Genre Chips Component
const GenreChips = ({ genres }) => {
  // Limit to max 3 genres
  const displayGenres = genres?.slice(0, 3) || [];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {displayGenres.map((genre, index) => {
        // Get color class, default to a neutral color if not found
        const colorClass =
          GENRE_COLORS[genre.name] || "bg-slate-600/20 text-slate-400";

        return (
          <span
            key={index}
            className={`
              ${colorClass} 
              px-2 py-1 rounded-full 
              text-[10px] font-medium 
              flex items-center 
              transition-all duration-300 
              hover:scale-105
            `}
          >
            <Tag size={12} className="mr-1 opacity-70" />
            {genre.name}
          </span>
        );
      })}
    </div>
  );
};

// Continue Watching Card component
const ContinueWatchingCard = ({ movie, isFavorite, handleFavoriteToggle }) => {
  const [fullMovieDetails, setFullMovieDetails] = useState(null);

  useEffect(() => {
    const loadMovieDetails = async () => {
      const details = await fetchMovieDetails(movie.id);
      setFullMovieDetails(details);
    };

    loadMovieDetails();
  }, [movie.id]);

  const getImagePath = (posterPath) => {
    if (posterPath) return `https://image.tmdb.org/t/p/w342/${posterPath}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const additionalDetails = {
    rating: fullMovieDetails?.vote_average
      ? `${fullMovieDetails.vote_average.toFixed(1)}/10`
      : "N/A",
    date: formatDate(fullMovieDetails?.release_date),
    genres: fullMovieDetails?.genres || [],
    overview:
      fullMovieDetails?.overview || movie.overview || "No overview available",
  };

  return (
    <div className="p-2 h-full">
      <div className="bg-slate-800/80 rounded-xl h-full overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative group">
        <Link
          href={`/movie/${movie.id}`}
          title={movie.title}
          className="block relative"
        >
          <Image
            src={getImagePath(
              fullMovieDetails?.poster_path || movie.poster_path
            )}
            alt={movie.title || "Untitled Movie Poster"}
            className="w-full h-48 object-cover rounded-t-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
            width={288}
            height={176}
            unoptimized
          />
          <div className="absolute top-2 left-2 bg-black/40 text-white/90 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
            {fullMovieDetails?.type || "Movie"}
          </div>
        </Link>

        <Link href={`/movie/${movie.id}`}>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
            <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
              {additionalDetails.overview}
            </p>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>
        </Link>

        <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
          <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
            {movie.title || "Untitled"}
          </h3>

          <div className="flex flex-col space-y-2 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star size={14} className="mr-1 text-yellow-500" />
                <span>{additionalDetails.rating}</span>
              </div>

              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{additionalDetails.date}</span>
              </div>
            </div>

            {/* Creative Genre Display */}
            <GenreChips genres={additionalDetails.genres} />
          </div>
        </div>

        <button
          onClick={() => handleFavoriteToggle(movie.id)}
          className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            fill={isFavorite ? "red" : "none"}
            stroke={isFavorite ? "red" : "white"}
            className="transition-colors"
          />
        </button>
      </div>
    </div>
  );
};
// Continue Watching Component
const ContinueWatching = () => {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Fetch movies details from localStorage
    const storedMovies = JSON.parse(
      localStorage.getItem("continueWatching") || "[]"
    );
    const storedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setMovies(storedMovies);
    setFavorites(storedFavorites);
  }, []);

  const handleFavoriteToggle = (movieId) => {
    const updatedFavorites = favorites.includes(movieId)
      ? favorites.filter((id) => id !== movieId)
      : [...favorites, movieId];

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const settings = {
    dots: true,
    infinite: movies.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, movies.length),
    slidesToScroll: 1,
    className: "continue-watching-slider",
    dotsClass: "slick-dots custom-dots",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, movies.length),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>
      {movies.length > 0 ? (
        <Slider {...settings}>
          {movies.map((movie) => (
            <ContinueWatchingCard
              key={movie.id}
              movie={movie}
              isFavorite={favorites.includes(movie.id)}
              handleFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </Slider>
      ) : (
        <p className="text-slate-400 text-center">
          No movies to continue watching. Start watching one now!
        </p>
      )}

      <style jsx global>{`
        .continue-watching-slider .slick-list {
          margin: 0 -10px;
        }

        .continue-watching-slider .slick-slide > div {
          margin: 0 10px;
        }

        .continue-watching-slider .custom-dots {
          bottom: -25px;
        }

        .continue-watching-slider .custom-dots li {
          margin: 0 5px;
        }

        .continue-watching-slider .custom-dots li button:before {
          color: #718096;
          opacity: 0.5;
          font-size: 10px;
        }

        .continue-watching-slider .custom-dots li.slick-active button:before {
          color: #4299e1;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ContinueWatching;

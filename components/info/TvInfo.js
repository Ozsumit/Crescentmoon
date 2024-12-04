"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Star, Clock, CalendarDays, Heart } from "lucide-react";
import SeasonDisplay from "../display/SeasonDisplay";

const TvInfo = (props) => {
  const { TvDetail, genreArr, id } = props;
  const [isFavorite, setIsFavorite] = useState(false);

  // Fallback for missing poster
  const posterPath = TvDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500/${TvDetail.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  // Toggle Favorite Status
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== TvDetail.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      if (!favorites.some((item) => item.id === TvDetail.id)) {
        favorites.push(TvDetail);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
    setIsFavorite(!isFavorite);
  };

  // Initialize Favorite Status
  React.useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isTvShowFavorited = favorites.some((item) => item.id === TvDetail.id);
    setIsFavorite(isTvShowFavorited);
  }, [TvDetail.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br pt-16 from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* TV Show Header */}
        <div className="grid lg:grid-cols-[350px_1fr] gap-8 mb-8">
          {/* Poster Section */}
          <div className="relative group mx-auto max-w-[350px] w-full">
            <Image
              src={posterPath}
              alt={TvDetail.name || "TV Show Poster"}
              width={350}
              height={525}
              className="rounded-2xl shadow-2xl transform transition-all 
                duration-300 group-hover:scale-105 group-hover:shadow-3xl"
              priority
            />
          </div>

          {/* TV Show Details */}
          <div className="lg:pl-8">
            <h1
              className="text-4xl lg:text-5xl font-black mb-4 text-transparent bg-clip-text 
              bg-gradient-to-r from-indigo-400 to-pink-600"
            >
              {TvDetail.name}
            </h1>

            {/* TV Show Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-slate-300">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400 w-5 h-5" />
                <span className="font-semibold">
                  {TvDetail.vote_average?.toFixed(1) || "N/A"}/10
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>{TvDetail.number_of_seasons} Seasons</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-pink-400" />
                <span>
                  {TvDetail.first_air_date
                    ? new Date(TvDetail.first_air_date).getFullYear()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full 
                    text-sm transition-colors hover:bg-indigo-800"
                >
                  {genre.name || genre}
                </span>
              ))}
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className="flex items-center text-sm bg-black/50 px-4 py-2 rounded-lg hover:bg-black/70 transition-colors"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={20}
                fill={isFavorite ? "red" : "none"}
                stroke={isFavorite ? "red" : "white"}
                className="mr-2 transition-colors"
              />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>

            {/* Overview */}
            <p className="text-slate-400 text-base leading-relaxed mt-6">
              {TvDetail.overview}
            </p>

            {/* Additional TV Show Info */}
            <div className="mt-6 space-y-2 text-slate-300">
              <p>
                <strong>Total Episodes:</strong> {TvDetail.number_of_episodes}
              </p>
              <p>
                <strong>Status:</strong> {TvDetail.status}
              </p>
            </div>
          </div>
        </div>

        {/* Seasons Display */}
        {TvDetail.seasons && TvDetail.seasons.length > 0 && (
          <div className="mt-8">
            <SeasonDisplay
              key={TvDetail.id}
              SeasonCards={TvDetail.seasons}
              TvDetails={TvDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TvInfo;

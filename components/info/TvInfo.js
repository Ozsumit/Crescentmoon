"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Clock, CalendarDays, Heart } from "lucide-react";
import SeasonDisplay from "../display/SeasonDisplay";

const TvInfo = ({ TvDetail, genreArr }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Fallback for missing poster
  const posterPath = TvDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500/${TvDetail.poster_path}`
    : "https://i.imgur.com/xDHFGVl.jpeg";

  const backgroundPath = TvDetail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${TvDetail.backdrop_path}`
    : posterPath;

  // Handle Favorite Toggle
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
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
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorited = favorites.some((item) => item.id === TvDetail.id);
    setIsFavorite(isFavorited);
  }, [TvDetail.id]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-16 text-slate-100 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundPath}
          alt={`${TvDetail.name} background`}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="opacity-20 blur-sm"
          onLoadingComplete={() => setIsImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 container mx-auto px-4 py-8 max-w-6xl transition-opacity duration-700 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          {/* Poster Section */}
          <div className="relative group max-w-md mx-auto md:sticky md:top-8">
            <div className="relative overflow-hidden rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src={posterPath}
                alt={TvDetail.name || "TV Show Poster"}
                width={350}
                height={525}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6 md:pl-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 leading-tight">
              {TvDetail.name}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap items-center space-x-4 text-slate-400">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400 w-5 h-5 animate-pulse" />
                <span className="font-medium">
                  {TvDetail.vote_average?.toFixed(1) || "N/A"}/10
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-indigo-400 w-5 h-5" />
                <span>{TvDetail.number_of_seasons} Seasons</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays className="text-pink-400 w-5 h-5" />
                <span>
                  {TvDetail.first_air_date
                    ? new Date(TvDetail.first_air_date).getFullYear()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-indigo-900/30 text-indigo-200 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-indigo-800/50 hover:scale-105 hover:shadow-lg"
                >
                  {genre.name || genre}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-indigo-900/30 shadow-inner">
              {TvDetail.overview}
            </p>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center px-5 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                isFavorite
                  ? "bg-gradient-to-r from-pink-600/60 to-red-600/60 text-pink-100"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              <Heart
                size={20}
                fill={isFavorite ? "rgb(251 113 133)" : "none"}
                stroke={isFavorite ? "rgb(251 113 133)" : "currentColor"}
                className={`mr-2 ${isFavorite ? "animate-pulse" : ""}`}
              />
              {isFavorite ? "Remove Favorite" : "Add Favorite"}
            </button>

            {/* Additional Info */}
            <div className="space-y-2 text-slate-300">
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

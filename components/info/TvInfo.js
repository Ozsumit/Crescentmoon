"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Clock, CalendarDays, Heart, User, Loader } from "lucide-react";
import SeasonDisplay from "../display/SeasonDisplay";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const TvInfo = ({ TvDetail, genreArr }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [castInfo, setCastInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch Cast Info
  useEffect(() => {
    const fetchCastInfo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${TvDetail.id}/credits?api_key=${TMDB_API_KEY}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch cast info");
        }
        const data = await response.json();
        setCastInfo(data.cast.slice(0, 10));
      } catch (error) {
        console.error("Error fetching cast info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCastInfo();
  }, [TvDetail.id]);

  return (
    <div className="bg-gradient-to-br rounded-lg pt-[8.5rem] from-slate-900 via-slate-800 to-slate-900 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-[350px_1fr] gap-8">
          {/* Poster Section */}
          <div className="relative mx-auto max-w-[350px] w-full group">
            <Image
              src={posterPath}
              alt={TvDetail.name || "TV Show Poster"}
              width={350}
              height={525}
              className="rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl"
              priority
            />
          </div>

          {/* Details Section */}
          <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
              {TvDetail.name}
            </h1>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-6 text-slate-300 mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{TvDetail.vote_average?.toFixed(1) || "N/A"}/10</span>
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
            <div className="flex flex-wrap gap-2 items-center justify-center mb-6">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-indigo-900/30 h-8 text-indigo-200 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-indigo-800/50 hover:scale-105 hover:shadow-lg"
                >
                  {genre.name || genre}
                </span>
              ))}
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center px-5 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 \\${
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
            </div>

            {/* Overview Section */}
            <div className="bg-slate-800 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">
                Overview
              </h3>
              <p className="text-slate-400 text-base leading-relaxed text-center mb-6">
                {TvDetail.overview || "No overview available for this TV show."}
              </p>
            </div>

            {/* Cast Info Section */}
            {isLoading ? (
              <div className="flex justify-center items-center mb-6">
                <Loader className="w-12 h-12 animate-spin text-indigo-500" />
              </div>
            ) : (
              castInfo.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-indigo-400">
                    Top Cast
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {castInfo.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex items-center space-x-3"
                      >
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                            alt={actor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-white font-medium">
                            {actor.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {actor.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Additional Info */}
            <div className="space-y-2 text-slate-300 mt-6">
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

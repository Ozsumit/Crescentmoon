import React, { useState } from "react";
import {
  Play,
  Clock,
  Star,
  CalendarDays,
  Bookmark,
  PlayCircle,
} from "lucide-react";

const MovieDetails = ({ MovieDetail, genreArr, videoId }) => {
  const [showVideo, setShowVideo] = useState(false);

  // Convert minutes to hours and minutes
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Movie Title Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            {MovieDetail.title}
          </h1>

          {/* Movie Stats */}
          <div className="flex items-center space-x-6 text-slate-300">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>{MovieDetail.vote_average.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>{formatRuntime(MovieDetail.runtime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-pink-400" />
              <span>
                {MovieDetail.release_date
                  ? new Date(MovieDetail.release_date).getFullYear()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Movie Content Grid */}
        <div className="grid md:grid-cols-[300px_1fr] gap-8 max-w-4xl mx-auto">
          {/* Poster Section */}
          <div className="relative group">
            <img
              src={`https://image.tmdb.org/t/p/w300${MovieDetail.poster_path}`}
              alt={MovieDetail.title || "Movie Poster"}
              className="rounded-xl shadow-xl transition-transform group-hover:scale-105"
            />
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="text-white w-20 h-20" />
            </button>
          </div>

          {/* Movie Details */}
          <div>
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
              {genreArr?.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-400">
                Synopsis
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {MovieDetail.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => setShowVideo(true)}
            className="flex items-center bg-gradient-to-r from-indigo-600 to-pink-600 
            text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-pink-700 
            transition-transform hover:scale-105"
          >
            <PlayCircle className="mr-2" />
            Watch Trailer
          </button>
          <button
            className="flex items-center bg-slate-700 text-white px-6 py-3 rounded-lg 
            hover:bg-slate-600 transition-colors"
          >
            <Bookmark className="mr-2" />
            Watchlist
          </button>
        </div>

        {/* Video Player Section */}
        {showVideo && videoId && (
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="relative pt-[56.25%]">
              {/* 16:9 Aspect Ratio */}
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-xl"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <button
              onClick={() => setShowVideo(false)}
              className="mt-4 bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Close Trailer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;

import React from "react";
import { Clock, Star, CalendarDays, Bookmark, PlayCircle } from "lucide-react";

const MovieDetails = ({ MovieDetail, genreArr }) => {
  // Convert minutes to hours and minutes
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl shadow-2xl text-white">
      <div className="flex items-center mb-4">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold mr-3">
          MOVIE
        </span>
        <div className="flex items-center text-yellow-400">
          <Star className="w-5 h-5 mr-1 fill-current" />
          <span className="font-bold">
            {MovieDetail.vote_average.toFixed(1)}/10
          </span>
        </div>
      </div>
      <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-8">
        {/* Poster Section */}
        <div className="relative group">
          <Image
            src={posterPath}
            alt={MovieDetail.title || "Movie Poster"}
            width={300}
            height={450}
            className="rounded-xl shadow-xl group-hover:scale-105 transition-transform"
          />
          <button
            onClick={toggleTrailer}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="text-white w-20 h-20" />
          </button>
        </div>

        {/* Movie Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4 text-white">
            {MovieDetail.title}
          </h1>

          {/* Movie Stats */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400" />
              <span>{MovieDetail.vote_average?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock />
              <span>{formatRuntime(MovieDetail.runtime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays />
              <span>
                {MovieDetail.release_date
                  ? new Date(MovieDetail.release_date).getFullYear()
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {genreArr?.map((genre) => (
              <span
                key={genre.id}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-gray-300 mb-6">{MovieDetail.overview}</p>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white leading-tight">
        {MovieDetail.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-5 text-zinc-300">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-400" />
          <span>{MovieDetail.release_date.substr(0, 4)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <span>{formatRuntime(MovieDetail.runtime)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {genreArr.map((genre, index) => (
          <span
            key={index}
            className="bg-zinc-700 text-zinc-200 px-3 py-1 rounded-full text-sm"
          >
            {genre}
          </span>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Synopsis</h2>
        <p className="text-zinc-300 leading-relaxed">{MovieDetail.overview}</p>
      </div>

      <div className="flex space-x-4">
        <button className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          <PlayCircle className="mr-2" />
          Watch Trailer
        </button>
        <button className="flex items-center bg-zinc-700 text-white px-6 py-3 rounded-lg hover:bg-zinc-600 transition-colors">
          <Bookmark className="mr-2" />
          Watchlist
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;

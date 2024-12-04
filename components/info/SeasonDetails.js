import React from "react";
import Image from "next/image";
import { Calendar, Film, Star } from "lucide-react";
import SeasonDetails from "./SeasonDetails";
import EpisodeDisplay from "../display/EpisodeDisplay";

const SeasonInfo = (props) => {
  let { SeasonInfos, id } = props;
  let episodes = SeasonInfos.episodes || [];

  // Fallback for missing poster
  const posterPath = SeasonInfos.poster_path
    ? `https://image.tmdb.org/t/p/w500/${SeasonInfos.poster_path}`
    : "https://i.imgur.com/a5SqB4h.jpeg";

  const airYear = SeasonInfos.air_date
    ? SeasonInfos.air_date.substr(0, 4)
    : "N/A";

  return (
    <div className="bg-gradient-to-br rounded-lg from-slate-900 via-slate-800 to-slate-900 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-[350px_1fr] gap-8">
          {/* Poster Section */}
          <div className="relative mx-auto max-w-[350px] w-full group">
            <Image
              src={posterPath}
              alt={SeasonInfos.name || "Season Poster"}
              width={350}
              height={525}
              className="rounded-2xl shadow-2xl transform transition-all 
                duration-300 group-hover:scale-105 group-hover:shadow-3xl"
              priority
            />
          </div>

          {/* Season Details */}
          <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl">
            <h1
              className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent 
              bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600"
            >
              {SeasonInfos.name}
            </h1>

            {/* Season Metadata */}
            <div className="flex justify-center items-center space-x-6 text-slate-300 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>{airYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-pink-400" />
                <span>{episodes.length} Episodes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{SeasonInfos.vote_average?.toFixed(1) || "N/A"}/10</span>
              </div>
            </div>

            {/* Season Overview */}
            <p className="text-slate-400 text-base leading-relaxed text-center mb-6">
              {SeasonInfos.overview || "No overview available for this season."}
            </p>

            {/* Episode Count Visualization */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                <span>Total Episodes</span>
                <span className="font-bold text-indigo-400">
                  {episodes.length}
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${Math.min(episodes.length * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-12 bg-slate-800/70 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
            Episodes
          </h2>
          <div className="">
            {/* Your existing EpisodeDisplay component goes here */}
            <EpisodeDisplay EpisodeInfos={episodes} seriesId={id} />{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonInfo;

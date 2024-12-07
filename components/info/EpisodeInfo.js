import React from "react";
import { Play, Clock, CalendarDays } from "lucide-react";

const EpisodeInfo = ({ episodeDetails, seriesId, seasonData, seriesData }) => {
  const totalEpisodes = seasonData.episodes.length;
  const totalSeasons = seriesData.number_of_seasons;

  return (
    <div className="bg-gradient-to-br rounded-xl pt-16 from-slate-900 via-slate-800 to-slate-900 min-h-screen py-12">
      <div className="container mx-auto px-4 space-y-10">
        {/* Episode Details Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            {episodeDetails.name}
          </h1>
          <div className="flex items-center space-x-4 text-slate-300">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>
                {episodeDetails.runtime
                  ? `${Math.floor(episodeDetails.runtime / 60)}h ${
                      episodeDetails.runtime % 60
                    }m`
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-pink-400" />
              <span>
                {episodeDetails.air_date
                  ? new Date(episodeDetails.air_date).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div>
              Season {episodeDetails.season_number}, Episode{" "}
              {episodeDetails.episode_number}
            </div>
          </div>
        </div>

        {/* Video Embed Section */}
        <div className="flex justify-center mb-8">
          <iframe
            className="w-full md:w-3/4 lg:w-2/3 aspect-video rounded-xl shadow-xl"
            src={`https://2embed.cc/embed/${seriesId}/${episodeDetails.season_number}-${episodeDetails.episode_number}`}
            frameBorder="0"
            sandbox="allow-scripts allow-orientation-lock allow-same-origin"
            allowFullScreen
          ></iframe>
        </div>

        {/* Description Section */}
        <div className="max-w-4xl mx-auto text-center text-slate-300 px-4">
          <p className="text-base leading-relaxed">{episodeDetails.overview}</p>
        </div>

        {/* Navigation Section */}
        <div className="flex justify-center space-x-4 mt-8">
          {/* Previous Episode Button */}
          <button className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-colors">
            Previous Episode
          </button>

          {/* Next Episode Button */}
          <button
            className="bg-gradient-to-r from-indigo-600 to-pink-600 
            text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-pink-700 
            transition-all transform hover:scale-105"
          >
            Next Episode
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeInfo;

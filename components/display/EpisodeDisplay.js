import React from "react";
import Link from "next/link";
import { Play, Clock, Calendar } from "lucide-react";

const EpisodeDisplay = ({ EpisodeInfos, seriesId }) => {
  // Validate props
  if (!Array.isArray(EpisodeInfos) || !seriesId) {
    console.error("Invalid props provided to EpisodeDisplay:", {
      EpisodeInfos,
      seriesId,
    });
    return (
      <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl">
        <p className="text-red-400 text-center">Unable to load episodes</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl">
      <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
        Episodes
      </h2>

      <div className="w-full flex justify-center mt-4 mb-8">
        <span className="w-4/5 bg-slate-600 h-0.5"></span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {EpisodeInfos.map((episode, index) => (
          <EpisodeCard
            key={`${seriesId}-${episode.episode_number}-${index}`}
            episodeinfo={episode}
            seriesId={seriesId}
          />
        ))}
      </div>
    </div>
  );
};

const EpisodeCard = ({ episodeinfo, seriesId }) => {
  // Data validation
  if (!episodeinfo || !seriesId) return null;

  const {
    episode_number,
    name,
    overview,
    still_path,
    air_date,
    runtime,
    season_number,
  } = episodeinfo;

  // Ensure we have the minimum required data
  if (!episode_number || !season_number) {
    console.error("Missing required episode data:", episodeinfo);
    return null;
  }

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "/placeholder-episode.jpg"; // Make sure to add a placeholder image

  // Construct the proper link
  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <Link href={episodeLink} legacyBehavior>
      <a className="block group relative bg-slate-900/50 rounded-xl overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
        {/* Episode Image */}
        <div className="relative aspect-video">
          <img
            src={imageUrl}
            alt={name || `Episode ${episode_number}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Episode Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-indigo-400 transition-colors truncate">
            {episode_number}. {name || `Episode ${episode_number}`}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
            {runtime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{runtime} min</span>
              </div>
            )}
            {air_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(air_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {overview && (
            <p className="text-sm text-gray-400 line-clamp-2">{overview}</p>
          )}
        </div>

        {/* Season & Episode Indicator */}
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm text-white">
          S{season_number} E{episode_number}
        </div>
      </a>
    </Link>
  );
};

export default EpisodeDisplay;

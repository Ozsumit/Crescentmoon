import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

const EpisodeListCard = ({ episode, seriesId, seasonNumber }) => {
  const episodeLink = `/series/${seriesId}/season/${seasonNumber}/episode/${episode.episode_number}`;
  const imageUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
    : "https://via.placeholder.com/500x300?text=No+Image";

  return (
    <div className="bg-slate-900/50 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <Link href={episodeLink} legacyBehavior>
        <a className="flex flex-row items-center gap-4 p-3 w-full transition-colors hover:bg-slate-800/50">
          <div className="relative w-32 aspect-square flex-shrink-0">
            <img
              src={imageUrl}
              alt={episode.name || `Episode ${episode.episode_number}`}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              S{seasonNumber} E{episode.episode_number}
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors truncate">
              {episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}
            </h3>
            {episode.runtime && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{episode.runtime} min</span>
              </div>
            )}
            {episode.overview && (
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {episode.overview}
              </p>
            )}
          </div>
        </a>
      </Link>
    </div>
  );
};

export default EpisodeListCard;

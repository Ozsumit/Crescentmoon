import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Play, Clock, Calendar } from "lucide-react";

const EpisodeCard = (props) => {
  // Debug log to see what props we're receiving
  console.log("EpisodeCard props:", props);

  // Check if props exists
  if (!props) {
    console.error("No props received in EpisodeCard");
    return null;
  }

  const { episodeinfo, seasonid } = props;

  // Debug log for destructured props
  console.log(
    "Destructured props - episodeinfo:",
    episodeinfo,
    "seriesId:",
    seasonid
  );

  // Early return with more specific error message
  if (!episodeinfo) {
    console.error("episodeinfo is undefined in EpisodeCard");
    return (
      <div className="bg-slate-700/50 rounded-xl p-4 text-white">
        Error loading episode data
      </div>
    );
  }

  if (!seriesId) {
    console.error("seriesId is undefined in EpisodeCard");
    return (
      <div className="bg-slate-700/50 rounded-xl p-4 text-white">
        Error loading series data
      </div>
    );
  }

  // Safe access to properties with nullish coalescing
  const {
    still_path = null,
    name = "",
    episode_number = 0,
    season_number = 0,
    runtime = null,
    air_date = null,
    overview = "",
  } = episodeinfo ?? {};

  // Debug log for destructured episodeinfo
  console.log("Destructured episodeinfo values:", {
    still_path,
    name,
    episode_number,
    season_number,
    runtime,
    air_date,
    overview,
  });

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w342/${still_path}`
    : "https://i.imgur.com/HIYYPtZ.png";

  return (
    <div className="bg-slate-700/50 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative">
      <Link
        href={`/series/${seasonid}/season/${season_number}/${episode_number}`}
        title={name || `Episode ${episode_number}`}
        className="block group"
      >
        <div className="relative aspect-video">
          <Image
            src={imageUrl}
            alt={name || `Episode ${episode_number}`}
            className="w-full h-full object-cover"
            width={288}
            height={176}
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      </Link>
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
      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm text-white">
        S{season_number} E{episode_number}
      </div>
    </div>
  );
};

export default EpisodeCard;

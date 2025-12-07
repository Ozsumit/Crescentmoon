"use client";
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
      <div className="p-12 text-center border border-white/5 rounded-[2rem] bg-white/5">
        <p className="text-neutral-500 font-mono uppercase">
          Unable to load episodes
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {EpisodeInfos.map((episode, index) => (
        <EpisodeCard
          key={`${seriesId}-${episode.episode_number}-${index}`}
          episodeinfo={episode}
          seriesId={seriesId}
        />
      ))}
    </div>
  );
};

const EpisodeCard = ({ episodeinfo, seriesId }) => {
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

  if (!episode_number || !season_number) return null;

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "https://via.placeholder.com/500x281?text=No+Image";

  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <Link href={episodeLink} legacyBehavior>
      <a className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300">
        {/* Episode Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
          <img
            src={imageUrl}
            alt={name || `Episode ${episode_number}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />

          {/* Dark Overlay on Hover */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>

          {/* Badge */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-[10px] font-mono text-white uppercase tracking-widest">
            S{season_number} E{episode_number}
          </div>
        </div>

        {/* Episode Info */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-neutral-300 transition-colors line-clamp-1">
              {name || `Episode ${episode_number}`}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-neutral-500 uppercase tracking-wide">
              {runtime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{runtime} MIN</span>
                </div>
              )}
              {air_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(air_date).getFullYear()}</span>
                </div>
              )}
            </div>
          </div>

          {overview && (
            <p className="text-sm text-neutral-400 font-light line-clamp-2 leading-relaxed mt-auto">
              {overview}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default EpisodeDisplay;

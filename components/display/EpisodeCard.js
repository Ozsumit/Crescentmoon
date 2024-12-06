import Image from "next/image";
import Link from "next/link";
import React from "react";

const EpisodeCard = (props) => {
  let { episodeinfo, seriesId } = props;
  let still_path = episodeinfo.still_path
    ? `https://image.tmdb.org/t/p/w342/${episodeinfo.still_path}`
    : "https://i.imgur.com/xDHFGVl.jpeg";

  return (
    <div className="bg-slate-700/50 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <Link
        href="/series/[id]/season/[seasonid]/[epid]"
        as={`/series/${seriesId}/season/${episodeinfo.season_number}/${episodeinfo.episode_number}`}
        title={episodeinfo.name}
        className="block"
      >
        <Image
          src={still_path}
          alt={episodeinfo.name}
          className="w-full h-48 object-cover"
          width={288}
          height={176}
          unoptimized
        />
      </Link>
      <div className="p-4">
        <p className="text-center text-slate-300">
          <span className="text-indigo-400 font-semibold">
            S{episodeinfo.season_number} E{episodeinfo.episode_number}:
          </span>{" "}
          <span className="text-slate-200">{episodeinfo.name}</span>
        </p>
      </div>
    </div>
  );
};

export default EpisodeCard;

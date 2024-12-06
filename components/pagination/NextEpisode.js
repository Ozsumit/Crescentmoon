import Link from "next/link";
import React from "react";
import { BiSkipPrevious, BiSkipNext } from "react-icons/bi";

const NextEpisode = (props) => {
  const { episodeDetails, totalEpisodes, seriesId, totalSeasons } = props;
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4 w-full">
      {/* Previous Episode Button */}
      <PrevEpisodeBtn episodeDetails={episodeDetails} seriesId={seriesId} />

      {/* Next Episode Button */}
      <NextEpisodeBtn
        episodeDetails={episodeDetails}
        totalEpisodes={totalEpisodes}
        seriesId={seriesId}
        totalSeasons={totalSeasons}
      />
    </div>
  );
};

export default NextEpisode;

function NextEpisodeBtn(props) {
  const { episodeDetails, totalEpisodes, seriesId, totalSeasons } = props;
  const isLastEpisode = Number(episodeDetails.episode_number) === totalEpisodes;
  const isLastSeason = Number(episodeDetails.season_number) === totalSeasons;

  return (
    <>
      {isLastEpisode ? (
        <Link
          href={`/series/[id]/season/[seasonid]`}
          as={`/series/${seriesId}/season/${
            isLastSeason
              ? episodeDetails.season_number
              : episodeDetails.season_number + 1
          }`}
          className={`${
            isLastSeason
              ? "pointer-events-none bg-slate-600 text-gray-400/25"
              : "bg-slate-600 hover:bg-slate-600/75 text-indigo-400"
          } transition-all px-4 py-2 flex items-center justify-center rounded-lg font-semibold text-sm gap-2`}
        >
          <p>Next Season</p>
          <BiSkipNext className="text-2xl" />
        </Link>
      ) : (
        <Link
          href={`/series/[id]/season/[seasonid]/[epid]`}
          as={`/series/${seriesId}/season/${episodeDetails.season_number}/${
            Number(episodeDetails.episode_number) + 1 <= totalEpisodes
              ? Number(episodeDetails.episode_number) + 1
              : episodeDetails.episode_number
          }`}
          className={`${
            isLastEpisode
              ? "pointer-events-none bg-slate-600 text-gray-400/25"
              : "bg-slate-600 hover:bg-slate-600/75 text-indigo-400"
          } transition-all px-4 py-2 flex items-center justify-center rounded-lg font-semibold text-sm gap-2`}
        >
          <p>Next Episode</p>
          <BiSkipNext className="text-2xl" />
        </Link>
      )}
    </>
  );
}

function PrevEpisodeBtn(props) {
  const { episodeDetails, seriesId } = props;
  const isFirstEpisode = Number(episodeDetails.episode_number) === 1;
  const isFirstSeason = Number(episodeDetails.season_number) === 1;

  return (
    <>
      {isFirstEpisode ? (
        <Link
          href={`/series/[id]/season/[seasonid]`}
          as={`/series/${seriesId}/season/${
            isFirstSeason
              ? episodeDetails.season_number
              : episodeDetails.season_number - 1
          }`}
          className={`${
            isFirstSeason
              ? "pointer-events-none bg-slate-600 text-gray-400/25"
              : "bg-slate-600 hover:bg-slate-600/75 text-indigo-400"
          } transition-all px-4 py-2 flex items-center justify-center rounded-lg font-semibold text-sm gap-2`}
        >
          <BiSkipPrevious className="text-2xl" />
          <p>Prev Season</p>
        </Link>
      ) : (
        <Link
          href={`/series/[id]/season/[seasonid]/[epid]`}
          as={`/series/${seriesId}/season/${episodeDetails.season_number}/${
            Number(episodeDetails.episode_number) - 1 < 1
              ? episodeDetails.episode_number
              : Number(episodeDetails.episode_number) - 1
          }`}
          className={`${
            isFirstEpisode
              ? "pointer-events-none bg-slate-600 text-gray-400/25"
              : "bg-slate-600 hover:bg-slate-600/75 text-indigo-400"
          } transition-all px-4 py-2 flex items-center justify-center rounded-lg font-semibold text-sm gap-2`}
        >
          <BiSkipPrevious className="text-2xl" />
          <p>Prev Episode</p>
        </Link>
      )}
    </>
  );
}

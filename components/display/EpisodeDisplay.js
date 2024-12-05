import React from "react";
import EpisodeCard from "./EpisodeCard";

const EpisodeDisplay = (props) => {
  let { EpisodeInfos, seriesId } = props;

  return (
    <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl">
      <h2
        className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent 
        bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600"
      >
        Episodes
      </h2>

      {/* Metadata Divider */}
      <div className="w-full flex justify-center mt-4 mb-8">
        <span className="w-4/5 bg-slate-600 h-0.5"></span>
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {EpisodeInfos.map((episode, index) => (
          <EpisodeCard key={index} episodeinfo={episode} seriesId={seriesId} />
        ))}
      </div>
    </div>
  );
};

export default EpisodeDisplay;

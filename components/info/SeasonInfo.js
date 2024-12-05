import React from "react";
import SeasonDetails from "./SeasonDetails";
import EpisodeDisplay from "../display/EpisodeDisplay";

const SeasonInfo = (props) => {
  let { SeasonInfos, id } = props;
  let episodes = SeasonInfos.episodes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Season Info Header */}
        <div className="flex flex-row flex-wrap justify-center items-center mb-10 mt-5 gap-8">
          <div className="flex-1 min-w-[300px]">
            <SeasonDetails SeasonInfos={SeasonInfos} />
          </div>
        </div>

        {/* Episodes Section */}
        <div className="bg-slate-900 rounded-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
            Episodes
          </h2>

          {/* Episodes Display Component (Uncomment and implement if needed) */}
          <EpisodeDisplay EpisodeInfos={episodes} seriesId={id} />

          {/* Example styling for Episode Items */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes?.map((episode, index) => (
              <div
                key={index}
                className="bg-slate-800 p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-indigo-400">
                  {episode.title}
                </h3>
                <p className="text-sm text-slate-400">{episode.description}</p>
                <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                  Watch
                </button>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SeasonInfo;

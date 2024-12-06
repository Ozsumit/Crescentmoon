import React from "react";
import SeasonCard from "./SeasonCard";

const SeasonDisplay = (props) => {
  let { SeasonCards, TvDetails } = props;
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-white text-xl sm:text-2xl text-center my-4">
        All Seasons
      </h1>

      <div className="w-full flex justify-center my-4">
        <hr className="w-4/5 border-t border-gray-600" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {SeasonCards.map((season, index) => (
          <SeasonCard
            key={index}
            SeasonDetails={season}
            SeriesId={TvDetails.id}
          />
        ))}
      </div>
    </div>
  );
};

export default SeasonDisplay;

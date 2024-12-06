import React from "react";
import TvPagination from "../pagination/TvPagination";
import TvCards from "./TvCards";

const TvDisplay = ({ series, pageid }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center py-12">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Trending TV Shows
        </h2>

        {/* Grid of TV Cards */}
        <div
          id="tv-shows"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
        >
          {series.map((serie) => (
            <TvCards key={serie.id} TvCard={serie} className="w-full" />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8">
          <TvPagination pageid={pageid} />
        </div>
      </div>
    </div>
  );
};

export default TvDisplay;

import React from "react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";

const HomeDisplay = (props) => {
  const { movies, pageid } = props;

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl p-6 my-8 rounded-xl shadow-2xl">
      {/* Title Section */}
      <h2
        className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent
        bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600"
      >
        Trending Movies & Series
      </h2>

      {/* Metadata Divider */}
      <div className="w-full flex justify-center mt-4 mb-8">
        <span className="w-4/5 bg-slate-600 h-0.5"></span>
      </div>

      {/* Movie Grid */}
      <div
        id="trending"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full"
      >
        {movies.map((movie) => (
          <HomeCards key={movie.id} MovieCard={movie} className="w-full" />
        ))}
      </div>

      {/* Pagination Section */}
      <div className="mt-8 mb-8 flex justify-center">
        <HomePagination pageid={pageid} />
      </div>
    </div>
  );
};

export default HomeDisplay;

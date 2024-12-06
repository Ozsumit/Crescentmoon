import React from "react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";

const HomeDisplay = (props) => {
  let { movies, pageid } = props;
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Trending Movies & Series
        </h2>

        <div
          id="trending"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
        >
          {movies.map((movie) => (
            <HomeCards key={movie.id} MovieCard={movie} className="w-full" />
          ))}
        </div>

        <div className="mt-8">
          <HomePagination pageid={pageid} />
        </div>
      </div>
    </div>
  );
};

export default HomeDisplay;

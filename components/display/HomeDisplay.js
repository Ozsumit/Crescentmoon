import React from "react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";

const HomeDisplay = (props) => {
  let { movies, pageid } = props;
  return (
    <>
      <div className="flex mt-16 flex-col justify-center items-center">
        <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Trending Movies & Series
        </h2>
        <div
          id="trending"
          className="flex  flex-wrap  justify-center py-10 px-5"
        >
          {movies.map((movie) => {
            return <HomeCards key={movie.id} MovieCard={movie} />;
          })}
        </div>
        <HomePagination pageid={pageid} />
      </div>{" "}
    </>
  );
};

export default HomeDisplay;

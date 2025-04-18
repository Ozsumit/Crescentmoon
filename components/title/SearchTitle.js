import React from "react";

const SearchTitle = () => {
  return (
    <div className=" flex place-content-center mt-5 mx-5">
      <h1 className="w-full md:w-1/2 lg:w-1/3 text-white text-xl sm:text-2xl md:text-3xl text-center font-semibold">
        Explore, Discover, and
        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
          {" "}
          Watch
        </span>
      </h1>
    </div>
  );
};

export default SearchTitle;

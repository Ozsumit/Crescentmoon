import React from "react";

const TvTitle = () => {
  return (
    <div className=" flex place-content-center mt-5 mx-5">
      <h1 className="w-full md:w-1/2 lg:w-1/3 text-white text-xl sm:text-2xl md:text-3xl text-center font-semibold">
        TV Shows &
        <span className="bg-gradient-to-r  from-indigo-500 to-purple-600 text-transparent bg-clip-text">
          {" "}
          Series
        </span>
      </h1>
    </div>
  );
};

export default TvTitle;

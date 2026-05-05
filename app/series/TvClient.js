"use client";

import TvDisplay from "@/components/display/TvDisplay";
import TvTitle from "@/components/title/TvTitle";
import SearchBar from "@/components/searchbar/SearchBar";
import HomeFilter from "@/components/filter/HomeFilter";

const TvClient = ({ series }) => {
  return (
    <div className="h-auto pt-16">
      {/* Optional UI */}
      {/* <TvTitle />
      <SearchBar />
      <HomeFilter /> */}

      <TvDisplay series={series} />
    </div>
  );
};

export default TvClient;

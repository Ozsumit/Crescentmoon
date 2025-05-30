"use client";
import AnimeDisplay from "@/components/display/animedisplay";
import MovieDisplay from "@/components/display/MovieDisplay";
import SearchDisplay from "@/components/display/SearchDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import MoviesTitle from "@/components/title/MoviesTitle";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await resp.json();
  let res = data.results;
  return res;
}

const Movies = async () => {
  const moviedata = await getData();

  return (
    <div className="  pt-16 h-auto">
 <AnimeDisplay/>
    </div>
  );
};

export default Movies;

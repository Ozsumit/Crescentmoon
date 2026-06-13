export const runtime = "edge";
import MoviesClient from "./MoviesClient";


async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`,
    { cache: "no-store" },
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await resp.json();
  return data.results;
}

const Movies = async () => {
  const moviedata = await getData();

  return <MoviesClient movies={moviedata} />;
};

export default Movies;
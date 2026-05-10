import MoviesClient from "./MoviesClient";

export const metadata = {
  title: "Movies - Cmoon",
  description:
    "Explore and watch the latest popular movies online in HD on Cmoon.",
  openGraph: {
    title: "Popular Movies - Cmoon",
    description:
      "Explore and watch the latest popular movies online in HD on Cmoon.",
    url: "https://cmoon.sumit.info.np/movie",
    type: "website",
  },
};

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

  return (
    <>
      <h1 className="sr-only">Browse Popular Movies - Cmoon</h1>
      <MoviesClient movies={moviedata} />
    </>
  );
};

export default Movies;

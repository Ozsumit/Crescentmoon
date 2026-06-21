import MoviesClient from "./MoviesClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`,
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    },
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await resp.json();
  return data.results;
}

export const metadata = {
  title: "Movies - Watch Online in HD | Cmoon",
  description: "Explore and watch the latest popular movies online in HD quality on Cmoon. Fast and responsive movie streaming.",
  keywords: ["watch movies online", "stream movies", "HD movies", "Cmoon", "popular movies"],
  openGraph: {
    title: "Movies - Watch Online in HD | Cmoon",
    description: "Explore and watch the latest popular movies online in HD quality on Cmoon.",
    url: `${BASE_URL}/movie`,
    siteName: "Cmoon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Movies - Watch Online in HD | Cmoon",
    description: "Explore and watch the latest popular movies online in HD quality on Cmoon.",
  },
};

const Movies = async () => {
  const moviedata = await getData();

  return <MoviesClient movies={moviedata} />;
};

export default Movies;

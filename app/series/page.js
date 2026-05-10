import TvDisplay from "@/components/display/TvDisplay";
import TvClient from "./TvClient";

export const metadata = {
  title: "TV Series - Cmoon",
  description:
    "Discover and stream trending TV shows and series online in HD on Cmoon.",
  openGraph: {
    title: "Trending TV Series - Cmoon",
    description:
      "Discover and stream trending TV shows and series online in HD on Cmoon.",
    url: "https://cmoon.sumit.info.np/series",
    type: "website",
  },
};

async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&page=1`,
    { cache: "no-store" },
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await resp.json();
  return data.results;
}

const Series = async () => {
  const seriesData = await getData();

  return (
    <>
      <h1 className="sr-only">Browse Trending TV Series - Cmoon</h1>
      <TvClient series={seriesData} />
    </>
  );
};

export default Series;

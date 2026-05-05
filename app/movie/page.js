import TvDisplay from "@/components/display/TvDisplay";
import TvClient from "./TvClient";

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

  return <TvClient series={seriesData} />;
};

export default Series;

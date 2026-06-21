import TvClient from "./TvClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&page=1`,
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
  title: "TV Series - Stream Online | Cmoon",
  description: "Watch trending TV shows and series online in HD quality on Cmoon. Stay updated with your favorite shows.",
  keywords: ["watch tv shows online", "stream series", "HD tv shows", "Cmoon", "trending series"],
  openGraph: {
    title: "TV Series - Stream Online | Cmoon",
    description: "Watch trending TV shows and series online in HD quality on Cmoon.",
    url: `${BASE_URL}/series`,
    siteName: "Cmoon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TV Series - Stream Online | Cmoon",
    description: "Watch trending TV shows and series online in HD quality on Cmoon.",
  },
};

const Series = async () => {
  const seriesData = await getData();

  return <TvClient series={seriesData} />;
};

export default Series;

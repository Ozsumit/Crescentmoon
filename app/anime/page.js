import AnimeClient from "./AnimeClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export const metadata = {
  title: "Watch Anime Online | Cmoon",
  description: "Stream your favorite anime series and movies in HD quality on Cmoon. Discover trending anime and classics.",
  keywords: ["anime streaming", "watch anime online", "Cmoon", "HD anime"],
  openGraph: {
    title: "Watch Anime Online | Cmoon",
    description: "Stream your favorite anime series and movies in HD quality on Cmoon.",
    url: `${BASE_URL}/anime`,
    siteName: "Cmoon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Anime Online | Cmoon",
    description: "Stream your favorite anime series and movies in HD quality on Cmoon.",
  },
};

const Anime = () => {
  return <AnimeClient />;
};

export default Anime;

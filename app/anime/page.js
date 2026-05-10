import AnimeDisplay from "@/components/display/animedisplay";

export const metadata = {
  title: "Anime - Cmoon",
  description:
    "Watch the latest and most popular anime series online in HD on Cmoon.",
  openGraph: {
    title: "Anime Streaming - Cmoon",
    description:
      "Watch the latest and most popular anime series online in HD on Cmoon.",
    url: "https://cmoon.sumit.info.np/anime",
    type: "website",
  },
};

const AnimePage = () => {
  return (
    <div className="pt-16 h-auto">
      <AnimeDisplay />
    </div>
  );
};

export default AnimePage;

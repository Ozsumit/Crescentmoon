// "use client";
import SpotlightCarousel from "@/components/display/carausel";
import HomeDisplay from "@/components/display/HomeDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import Title from "@/components/title/Title";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import TvDisplay from "@/components/display/TvDisplay";
import WelcomeModal from "@/components/welcome";
import AdblockerModal from "@/components/adblockmodel";

export const metadata = {
  title: "Cmoon - Watch Movies & TV Shows Online",
  description:
    "Stream movies and TV shows online in HD quality on Cmoon. Fast, responsive and entertainment-focused streaming platform.",
  openGraph: {
    title: "Cmoon - Watch Movies & TV Shows Online",
    description:
      "Watch movies, TV shows and anime online in HD quality on Cmoon.",
    url: "https://cmoon.sumit.info.np",
    siteName: "Cmoon",
    images: [
      {
        url: "https://cmoon.sumit.info.np/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Cmoon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const resp = await fetch(
    // `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
    `https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=${apiKey}`
  );

  if (!resp.ok) {
    console.error(`Error: ${resp.status} ${resp.statusText}`);
    throw new Error("Pussycat API error");
  }
  const data = await resp.json();
  if (!data.results) {
    console.error("Error: 'results' field is missing in the API response");
    throw new Error("Invalid API tung tung tung tung tung sahurrr response");
  }
  let res = data.results;
  return res;
}

export default async function Home() {
  const data = await getData();
  return (
    <div className=" m-0 bg-[rgb(7,8,9)] h-auto">
      <h1 className="sr-only">Cmoon - Watch Movies & TV Shows Online</h1>
    {/* <Title /> */}
      <SpotlightCarousel />
      {/* <SearchBar /> */}
      {/* <HomeFilter /> */}
      {/* <h1>Trending Movies</h1> div*/}
      <div className="w-full flex px-0 sm:px-4  justify-center items-center">
        <HomeDisplay movies={data} />
      </div>
      {/* <WelcomeModal /> */}
      {/* // Auto-show on first visit or version update */}
      {/* <WelcomeModal onClose={() => {}} /> */}

      {/* // Or use the trigger button */}
      <AdblockerModal />
    </div>
  );
}

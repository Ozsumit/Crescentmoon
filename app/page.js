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
    throw new Error("Invalid API response");
  }
  let res = data.results;
  return res;
}

export default async function Home() {
  const data = await getData();
  return (
    <div className=" m-0 bg-[rgb(7,8,9)] h-auto">
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

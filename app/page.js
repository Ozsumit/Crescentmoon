import SpotlightCarousel from "@/components/display/carausel";
import TopTen from "@/components/display/TopTen";
import HomeDisplay from "@/components/display/HomeDisplay";

import AdblockerModal from "@/components/adblockmodel";

async function getData() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    console.warn("TMDB API Key is missing. Using fallback mock data.");
    return Array.from({ length: 20 }).map((_, i) => ({
      id: `mock-${i}`,
      title: `Trending Item ${i + 1}`,
      name: `Trending Item ${i + 1}`,
      poster_path: null,
      backdrop_path: null,
      media_type: i % 2 === 0 ? "movie" : "tv",
      vote_average: 8.5,
      release_date: new Date().toISOString().split("T")[0],
      first_air_date: new Date().toISOString().split("T")[0],
      popularity: 1000 - i,
      overview: "Mock overview for visual verification.",
    }));
  }

  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=${apiKey}`,
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      },
    );

    if (!resp.ok) {
      throw new Error(`API responded with status: ${resp.status}`);
    }

    const data = await resp.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching trending data:", error);
    return [];
  }
}

export default async function Home() {
  const data = await getData();
  return (
    <div className=" m-0 bg-background text-foreground h-auto">
      {/* <Title /> */}
      <SpotlightCarousel />
      <TopTen />
      {/* <SearchBar /> */}
      {/* <HomeFilter /> */}
      {/* <h1>Trending Movies</h1> div*/}
      <div className="w-full flex px-0 sm:px-4  justify-center items-center">
        <HomeDisplay initialData={data} />
      </div>
      {/* <WelcomeModal /> */}
      {/* // Auto-show on first visit or version update */}
      {/* <WelcomeModal onClose={() => {}} /> */}

      {/* // Or use the trigger button */}
      <AdblockerModal />
    </div>
  );
}

export async function load({ fetch }) {
  const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";

  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=${apiKey}`
    );

    if (!resp.ok) {
      throw new Error(`API responded with status: ${resp.status}`);
    }

    const data = await resp.json();
    return {
      trending: data.results || []
    };
  } catch (error) {
    console.error("Error fetching trending data inside SvelteKit load:", error);
    return {
      trending: Array.from({ length: 20 }).map((_, i) => ({
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
      }))
    };
  }
}

import { getVideoSources } from "$lib/video-sources";

export async function load({ params, url, fetch }) {
  const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
  const { id } = params;

  try {
    const mainUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,videos,recommendations,reviews`;
    const res = await fetch(mainUrl);
    if (!res.ok) throw new Error("TMDB Error");
    const data = await res.json();

    const seasons = data.seasons || [];
    const videoSources = await getVideoSources("tv");

    // Load active season episodes
    const activeSeasonNum = Number(url.searchParams.get("season")) || 1;
    let episodes = [];
    try {
      const epRes = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${activeSeasonNum}?api_key=${apiKey}`);
      if (epRes.ok) {
        const epData = await epRes.json();
        episodes = epData.episodes || [];
      }
    } catch (e) {
      console.error("Failed to load season episodes", e);
    }

    return {
      series: data,
      id,
      seasons,
      videoSources,
      activeSeasonNum,
      episodes
    };
  } catch (e) {
    console.error(e);
    return {
      series: { name: "Series Not Found", overview: "The series details could not be retrieved." },
      id,
      seasons: [],
      videoSources: [],
      activeSeasonNum: 1,
      episodes: []
    };
  }
}

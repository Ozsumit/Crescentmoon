import { getVideoSources } from "$lib/video-sources";

export async function load({ params, fetch }) {
  const { id } = params;

  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const animeRes = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    if (!animeRes.ok) throw new Error("Anime not found in Jikan API");
    const animeData = await animeRes.json();

    await delay(300);

    const charactersRes = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
    let characters = [];
    if (charactersRes.ok) {
      const chars = await charactersRes.json();
      characters = chars.data || [];
    }

    const videoSources = await getVideoSources("tv");

    return {
      anime: animeData.data || null,
      characters: characters.slice(0, 10),
      id,
      videoSources
    };
  } catch (e) {
    console.error("Error loading anime on SvelteKit server load:", e);
    return {
      anime: null,
      characters: [],
      id,
      videoSources: []
    };
  }
}

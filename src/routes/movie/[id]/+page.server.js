import { getVideoSources } from "$lib/video-sources";

export async function load({ params, fetch }) {
  const apiKey = "1c305b9b6f84cc8e1ef6a72e816a1eb1";
  const { id } = params;

  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos,recommendations,reviews`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDB Error");
    const data = await res.json();
    const genreArr = data.genres || [];

    const videoSources = await getVideoSources("movie");

    return {
      movie: data,
      genreArr,
      id,
      videoSources
    };
  } catch (e) {
    console.error(e);
    return {
      movie: { title: "Movie Not Found", overview: "The movie could not be loaded." },
      genreArr: [],
      id,
      videoSources: []
    };
  }
}

import { getVideoSources } from "$lib/video-sources";

export async function load() {
  const movieServers = await getVideoSources("movie");
  const tvServers = await getVideoSources("tv");
  return {
    movieServers,
    tvServers
  };
}

import { getFeedback, getVideoSources } from "$lib/video-sources";

export async function load() {
  const feedbacks = await getFeedback();
  const videoSources = await getVideoSources();

  return {
    feedbacks,
    videoSources
  };
}

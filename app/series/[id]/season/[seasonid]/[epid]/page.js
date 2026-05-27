import EpisodeInfo from "@/components/info/EpisodeInfo";
import { getVideoSources } from "@/app/abmin/action";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

/**
 * ✅ Fetch Episode Data
 */
async function fetchEpisodeData(id, seasonid, epid) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!id || !seasonid || !epid) {
    throw new Error("Missing required parameters");
  }

  const [seriesResp, seasonResp, episodeResp] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`, {
      next: { revalidate: 3600 },
    }),

    fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}?api_key=${apiKey}`,
      {
        next: { revalidate: 3600 },
      },
    ),

    fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}/episode/${epid}?api_key=${apiKey}&append_to_response=credits,videos`,
      {
        next: { revalidate: 3600 },
      },
    ),
  ]);

  if (!seriesResp.ok || !seasonResp.ok || !episodeResp.ok) {
    throw new Error("Failed to fetch data");
  }

  const [seriesData, seasonData, episodeData] = await Promise.all([
    seriesResp.json(),
    seasonResp.json(),
    episodeResp.json(),
  ]);

  return { seriesData, seasonData, episodeData };
}

/**
 * ✅ Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { id, seasonid, epid } = params;

  try {
    const { seriesData, episodeData } = await fetchEpisodeData(
      id,
      seasonid,
      epid,
    );

    const title = `${episodeData.name} - ${seriesData.name} | Cmoon`;

    const description =
      episodeData.overview?.slice(0, 155) ||
      `Watch ${episodeData.name} from ${seriesData.name} online in HD quality on Cmoon.`;

    const image = episodeData.still_path
      ? `https://image.tmdb.org/t/p/w780${episodeData.still_path}`
      : `${BASE_URL}/og-banner.jpg`;

    return {
      title,
      description,

      keywords: [
        episodeData.name,
        seriesData.name,
        `Season ${seasonid}`,
        `Episode ${epid}`,
        "watch episodes online",
        "HD streaming",
        "Cmoon",
      ],

      alternates: {
        canonical: `${BASE_URL}/series/${id}/season/${seasonid}/episode/${epid}`,
      },

      openGraph: {
        title,
        description,
        url: `${BASE_URL}/series/${id}/season/${seasonid}/episode/${epid}`,
        siteName: "Cmoon",
        type: "video.episode",

        images: [
          {
            url: image,
            width: 1280,
            height: 720,
            alt: episodeData.name,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Episode Details | Cmoon",
      description: "Watch TV episodes online on Cmoon.",
    };
  }
}

/**
 * ✅ JSON-LD Structured Data
 */
function generateEpisodeSchema(episodeData, seriesData, id, seasonid, epid) {
  return {
    "@context": "https://schema.org",

    "@type": "TVEpisode",

    name: episodeData.name,

    description: episodeData.overview,

    episodeNumber: Number(epid),

    partOfSeason: {
      "@type": "TVSeason",
      seasonNumber: Number(seasonid),
    },

    partOfSeries: {
      "@type": "TVSeries",
      name: seriesData.name,
    },

    image: episodeData.still_path
      ? `https://image.tmdb.org/t/p/w780${episodeData.still_path}`
      : undefined,

    datePublished: episodeData.air_date,

    url: `${BASE_URL}/series/${id}/season/${seasonid}/episode/${epid}`,
  };
}

/**
 * ✅ Episode Details Page
 */
export default async function EpisodeDetailsPage({ params }) {
  const { id, seasonid, epid } = params;

  try {
    const [data, videoSources] = await Promise.all([
      fetchEpisodeData(id, seasonid, epid),
      getVideoSources("tv"),
    ]);

    const jsonLd = generateEpisodeSchema(
      data.episodeData,
      data.seriesData,
      id,
      seasonid,
      epid,
    );

    return (
      <>
        {/* ✅ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        <div className="p-4">
          <EpisodeInfo
            episodeDetails={data.episodeData}
            seriesId={id}
            seasonData={data.seasonData}
            seriesData={data.seriesData}
            videoSources={videoSources}
          />
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-neutral-950 p-4 text-red-500">
        <h1 className="text-xl font-semibold">Error Loading Episode Details</h1>

        <p>{error.message}</p>
      </div>
    );
  }
}

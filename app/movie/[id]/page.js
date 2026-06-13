export const runtime = "edge";
import MovieInfo from "@/components/info/MovieInfo";
import { getVideoSources } from "@/app/abmin/action";


const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`,
    {
      next: {
        revalidate: 1800, // Cache for 1 hour
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch movie data");
  }

  const data = await res.json();

  const genreArr = data?.genres?.map((genre) => genre.name) || [];

  return { data, genreArr, id };
}

/**
 * ✅ Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const { data, genreArr } = await getData(id);

    const title = `${data.title} (${data.release_date?.slice(0, 4)}) - | Cmoon`;

    const description =
      data.overview?.slice(0, 155) ||
      `Watch ${data.title} online in HD quality on Cmoon.`;

    const poster = data.poster_path
      ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
      : `${BASE_URL}/og-image.jpg`;

    const keywords = [
      data.title,
      ...genreArr,
      "watch movies online",
      "stream movies",
      "HD movies",
      "Cmoon",
    ];

    return {
      title,
      description,
      keywords,

      alternates: {
        canonical: `${BASE_URL}/movie/${id}`,
      },

      openGraph: {
        title,
        description,
        url: `${BASE_URL}/movie/${id}`,
        siteName: "Cmoon",
        images: [
          {
            url: poster,
            width: 1280,
            height: 720,
            alt: data.title,
          },
        ],
        locale: "en_US",
        type: "video.movie",
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [poster],
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      metadataBase: new URL(BASE_URL),

      category: "entertainment",
    };
  } catch (error) {
    return {
      title: "Movie Not Found | Cmoon",
      description: "The requested movie could not be found.",
    };
  }
}

/**
 * ✅ JSON-LD Structured Data
 */
function generateMovieSchema(data, id) {
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: data.title,
    image: `https://image.tmdb.org/t/p/w780${data.poster_path}`,
    description: data.overview,
    datePublished: data.release_date,
    aggregateRating: data.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: data.vote_average,
          ratingCount: data.vote_count,
        }
      : undefined,
    url: `${BASE_URL}/movie/${id}`,
  };
}

const MovieDetail = async ({ params }) => {
  const { id } = params;

  const [{ data, genreArr }, videoSources] = await Promise.all([
    getData(id),
    getVideoSources("movie"),
  ]);

  const jsonLd = generateMovieSchema(data, id);

  return (
    <>
      {/* ✅ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <MovieInfo
        MovieDetail={data}
        genreArr={genreArr}
        id={id}
        videoSources={videoSources}
      />
    </>
  );
};

export default MovieDetail;
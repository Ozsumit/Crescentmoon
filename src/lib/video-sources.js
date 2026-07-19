import { sql } from "$lib/db";
import { createId } from "@paralleldrive/cuid2";

export const MOVIE_SERVERS = [
  {
    id: "def-movie-1",
    name: "Server 1",
    url: "https://vidsrc.me/embed/movie/",
    paramStyle: "path-slash",
    features: ["HD", "Multi-Sub"],
    description: "Primary fast streaming node",
    priority: 1,
    active: true,
    type: "movie",
    icon: "Play"
  },
  {
    id: "def-movie-2",
    name: "vidsrc.me",
    url: "https://vidsrc.me/embed/movie/",
    paramStyle: "path-slash",
    features: ["HD"],
    description: "Stable legacy provider",
    priority: 2,
    active: true,
    type: "movie",
    icon: "Play"
  },
  {
    id: "def-movie-3",
    name: "vidsrc.to",
    url: "https://vidsrc.to/embed/movie/",
    paramStyle: "path-slash",
    features: ["HD", "Fast"],
    description: "New fast streaming node",
    priority: 3,
    active: true,
    type: "movie",
    icon: "Play"
  },
  {
    id: "def-movie-4",
    name: "vidsrc.pro",
    url: "https://vidsrc.pro/embed/movie/",
    paramStyle: "path-slash",
    features: ["4K", "Multi-Sub"],
    description: "Premium quality source",
    priority: 4,
    active: true,
    type: "movie",
    icon: "Play"
  },
  {
    id: "def-movie-5",
    name: "embed.su",
    url: "https://embed.su/embed/movie/",
    paramStyle: "query",
    features: ["HD"],
    description: "Alternative mirror",
    priority: 5,
    active: true,
    type: "movie",
    icon: "Play"
  }
];

export const TV_SERVERS = [
  {
    id: "def-tv-1",
    name: "vidking",
    url: "https://www.vidking.net/embed/tv/",
    paramStyle: "path-slash",
    icon: "Crown",
    features: ["Recommended", "Fast"],
    description: "Fast streaming with an interactive player.",
    priority: 1,
    active: true,
    type: "tv"
  },
  {
    id: "def-tv-2",
    name: "VidLink",
    url: "https://vidlink.pro/tv/",
    paramStyle: "path-slash",
    icon: "Play",
    features: ["Recommended"],
    description: "Fast loading with custom layout.",
    priority: 2,
    active: true,
    type: "tv"
  },
  {
    id: "def-tv-3",
    name: "VidAPI",
    url: "https://vaplayer.ru/embed/tv/",
    paramStyle: "path-slash",
    icon: "Webhook",
    features: ["Recommended"],
    description: "Highly stable Russian endpoint.",
    priority: 3,
    active: true,
    type: "tv"
  },
  {
    id: "def-tv-4",
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/tv/",
    paramStyle: "path-slash",
    icon: "Languages",
    features: ["Multi-Language"],
    description: "Good for non-English audio files.",
    priority: 4,
    active: true,
    type: "tv"
  }
];

export async function getFeedback() {
  try {
    const feedbackList = await sql`
      SELECT *
      FROM "Feedback"
      ORDER BY "createdAt" DESC
    `;
    return feedbackList || [];
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return [];
  }
}

export async function deleteFeedback(id) {
  try {
    await sql`
      DELETE FROM "Feedback"
      WHERE id = ${id}
    `;
    return { success: true };
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return { success: false, error: error.message };
  }
}

export async function getVideoSources(type) {
  try {
    let sources = [];
    if (type === "movie" || type === "tv") {
      sources = await sql`
        SELECT *
        FROM "VideoSource"
        WHERE active = true
          AND type = ${type}
        ORDER BY priority DESC
      `;
    } else {
      sources = await sql`
        SELECT *
        FROM "VideoSource"
        ORDER BY priority DESC
      `;
    }

    if (sources && sources.length > 0) {
      return sources;
    }
  } catch (error) {
    console.error("Database query for video sources failed. Using fallbacks.", error);
  }

  // Fallbacks
  const defaults = [...MOVIE_SERVERS, ...TV_SERVERS];
  if (type === "movie") {
    return MOVIE_SERVERS;
  } else if (type === "tv") {
    return TV_SERVERS;
  }
  return defaults;
}

export async function saveVideoSource(data) {
  const { id, ...source } = data;
  try {
    if (id) {
      await sql`
        UPDATE "VideoSource"
        SET
          name = ${source.name},
          url = ${source.url},
          params = ${source.params ?? null},
          type = ${source.type},
          priority = ${source.priority},
          active = ${source.active},
          icon = ${source.icon ?? null},
          features = ${JSON.stringify(source.features ?? null)},
          description = ${source.description ?? null},
          download = ${source.download ?? false},
          "parseUrl" = ${source.parseUrl ?? false},
          "paramStyle" = ${source.paramStyle ?? "query"},
          "updatedAt" = NOW()
        WHERE id = ${id}
      `;
    } else {
      const newId = createId();
      await sql`
        INSERT INTO "VideoSource" (
          id,
          name,
          url,
          params,
          type,
          priority,
          active,
          icon,
          features,
          description,
          download,
          "parseUrl",
          "paramStyle",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${newId},
          ${source.name},
          ${source.url},
          ${source.params ?? null},
          ${source.type},
          ${source.priority ?? 0},
          ${source.active ?? true},
          ${source.icon ?? null},
          ${JSON.stringify(source.features ?? null)},
          ${source.description ?? null},
          ${source.download ?? false},
          ${source.parseUrl ?? false},
          ${source.paramStyle ?? "query"},
          NOW(),
          NOW()
        )
      `;
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to save video source:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteVideoSource(id) {
  try {
    await sql`
      DELETE FROM "VideoSource"
      WHERE id = ${id}
    `;
    return { success: true };
  } catch (error) {
    console.error("Failed to delete video source:", error);
    return { success: false, error: error.message };
  }
}

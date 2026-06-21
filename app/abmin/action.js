"use server";

import { sql } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";

const TIMEZONE = process.env.ANALYTICS_TIMEZONE || "Asia/Kathmandu";

export async function getFeedback() {
  try {
    return await sql`
      SELECT *
      FROM "Feedback"
      ORDER BY "createdAt" DESC
    `;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error("Could not retrieve feedback data.");
  }
}

export async function deleteFeedback(id) {
  if (!id) {
    return { success: false, error: "ID parameter is required." };
  }

  try {
    await sql`
      DELETE FROM "Feedback"
      WHERE id = ${id}
    `;

    revalidatePath("/abmin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return { success: false, error: "Could not execute deletion query." };
  }
}

export async function getVideoSources(type) {
  try {
    if (type) {
      return await sql`
        SELECT *
        FROM "VideoSource"
        WHERE type = ${type}
        ORDER BY priority DESC
      `;
    }

    return await sql`
      SELECT *
      FROM "VideoSource"
      ORDER BY priority DESC
    `;
  } catch (error) {
    console.error("Error fetching video sources:", error);
    throw new Error("Could not retrieve video sources list.");
  }
}

export async function saveVideoSource(data) {
  try {
    if (!data || typeof data !== "object") {
      return { success: false, error: "Invalid database payload." };
    }

    const id = data.id;
    const name = data.name?.trim() || "Unnamed Source";
    const url = data.url?.trim() || "";
    const params = data.params?.trim() || null;
    const type = data.type === "tv" ? "tv" : "movie";
    const priority = Number.isInteger(Number(data.priority))
      ? Number(data.priority)
      : 0;
    const active = data.active !== false; // defaults to true
    const icon = data.icon?.trim() || "Play";
    const description = data.description?.trim() || null;
    const download = !!data.download;
    const parseUrl = !!data.parseUrl;
    const paramStyle = [
      "query",
      "path-slash",
      "path-hyphen-mapi",
      "cinesrc",
    ].includes(data.paramStyle)
      ? data.paramStyle
      : "query";

    // Standardize features extraction
    let featuresArray = [];
    if (Array.isArray(data.features)) {
      featuresArray = data.features.filter(
        (f) => typeof f === "string" && f.trim() !== "",
      );
    } else if (typeof data.features === "string") {
      featuresArray = data.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }
    const features = JSON.stringify(featuresArray);

    if (!url) {
      return { success: false, error: "Base player URL is required." };
    }

    if (id) {
      await sql`
        UPDATE "VideoSource"
        SET
          name = ${name},
          url = ${url},
          params = ${params},
          type = ${type},
          priority = ${priority},
          active = ${active},
          icon = ${icon},
          features = ${features},
          description = ${description},
          download = ${download},
          "parseUrl" = ${parseUrl},
          "paramStyle" = ${paramStyle},
          "updatedAt" = NOW()
        WHERE id = ${id}
      `;
    } else {
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
          ${createId()},
          ${name},
          ${url},
          ${params},
          ${type},
          ${priority},
          ${active},
          ${icon},
          ${features},
          ${description},
          ${download},
          ${parseUrl},
          ${paramStyle},
          NOW(),
          NOW()
        )
      `;
    }

    revalidatePath("/abmin");
    return { success: true };
  } catch (error) {
    console.error("Error saving video source:", error);
    return { success: false, error: "Database operation transaction failed." };
  }
}

export async function deleteVideoSource(id) {
  if (!id) {
    return { success: false, error: "ID parameter is required." };
  }

  try {
    await sql`
      DELETE FROM "VideoSource"
      WHERE id = ${id}
    `;

    revalidatePath("/abmin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting video source:", error);
    return { success: false, error: "Could not execute deletion query." };
  }
}

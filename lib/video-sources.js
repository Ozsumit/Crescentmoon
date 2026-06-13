"use server";

import { sql } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

export async function getFeedback() {
  return await sql`
    SELECT *
    FROM "Feedback"
    ORDER BY "createdAt" DESC
  `;
}

export async function deleteFeedback(id) {
  await sql`
    DELETE FROM "Feedback"
    WHERE id = ${id}
  `;

  revalidatePath("/abmin");
}

export async function getVideoSources(type) {
  try {
    if (type === "movie" || type === "tv") {
      return await sql`
        SELECT *
        FROM "VideoSource"
        WHERE active = true
          AND type = ${type}
        ORDER BY priority DESC
      `;
    }

    return await sql`
      SELECT *
      FROM "VideoSource"
      WHERE active = true
      ORDER BY priority DESC
    `;
  } catch (error) {
    console.error("Failed to fetch video sources:", error);
    return [];
  }
}

export async function saveVideoSource(data) {
  const { id, ...source } = data;

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
     const id = createId();
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

  revalidatePath("/abmin");
}

export async function deleteVideoSource(id) {
  await sql`
    DELETE FROM "VideoSource"
    WHERE id = ${id}
  `;

  revalidatePath("/abmin");
}

export async function seedVideoSources() {
  const movieSources = [
    // your existing movieSources array
  ];

  const tvSources = [
    // your existing tvSources array
  ];

  const allSources = [...movieSources, ...tvSources];

  for (const source of allSources) {
    const existing = await sql`
      SELECT id
      FROM "VideoSource"
      WHERE name = ${source.name}
        AND type = ${source.type}
      LIMIT 1
    `;

    if (existing.length === 0) {
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
const id = createId();
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
  }

  revalidatePath("/abmin");
}

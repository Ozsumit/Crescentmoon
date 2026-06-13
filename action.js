// actions.js
"use server";

import { sql } from "./lib/prisma";
import { getPostHogClient } from "./lib/posthog-server";

export async function submitFeedback(data) {
  try {
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO "Feedback" (id, type, rating, message, email, "createdAt")
      VALUES (${id}, ${data.type}, ${data.rating || null}, ${data.message}, ${data.email || null}, NOW())
    `;

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: data.email || "anonymous",
      event: "feedback_submitted",
      properties: {
        feedback_type: data.type,
        rating: data.rating,
        has_email: Boolean(data.email),
      },
    });

    return { success: true, message: "Transmission received." };
  } catch (error) {
    console.error("Feedback error:", error);
    return { success: false, message: "Failed to send data." };
  }
}

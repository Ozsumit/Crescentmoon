// actions.js
"use server";

// Import the singleton we just created
import { prisma } from "./lib/prisma";
import { getPostHogClient } from "./lib/posthog-server";

export async function submitFeedback(data) {
  try {
    await prisma.feedback.create({
      data: {
        type: data.type,
        rating: data.rating,
        message: data.message,
        email: data.email,
      },
    });

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

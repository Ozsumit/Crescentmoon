// actions.js
"use server";

// Import the singleton we just created
import { prisma } from "./lib/prisma";

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
    return { success: true, message: "Transmission received." };
  } catch (error) {
    console.error("Feedback error:", error);
    return { success: false, message: "Failed to send data." };
  }
}

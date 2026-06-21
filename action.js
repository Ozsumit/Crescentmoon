// actions.js
"use server";

export async function submitFeedback(data) {
  console.info("Feedback received locally:", {
    type: data.type,
    rating: data.rating,
    hasMessage: Boolean(data.message),
    hasEmail: Boolean(data.email),
  });

  return { success: true, message: "Transmission received." };
}

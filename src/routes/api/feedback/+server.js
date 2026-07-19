import { json } from "@sveltejs/kit";
import { sql } from "$lib/db";
import { createId } from "@paralleldrive/cuid2";

export async function POST({ request }) {
  try {
    const data = await request.json();
    const id = createId();
    const type = data.type || "review";
    const rating = Number.isInteger(data.rating) ? Number(data.rating) : null;
    const message = data.message || "";
    const email = data.email || null;

    await sql`
      INSERT INTO "Feedback" (id, type, rating, message, email, "createdAt")
      VALUES (${id}, ${type}, ${rating}, ${message}, ${email}, NOW())
    `;

    return json({ success: true });
  } catch (error) {
    console.error("Error inserting feedback on server endpoint:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

import { json } from "@sveltejs/kit";
import { deleteFeedback, saveVideoSource, deleteVideoSource } from "$lib/video-sources";

export async function POST({ request, url }) {
  try {
    const action = url.searchParams.get("action");
    const data = await request.json();

    if (action === "saveSource") {
      const res = await saveVideoSource(data);
      return json(res);
    }

    if (action === "deleteSource") {
      const res = await deleteVideoSource(data.id);
      return json(res);
    }

    if (action === "deleteFeedback") {
      const res = await deleteFeedback(data.id);
      return json(res);
    }

    return json({ success: false, error: "Action parameter not specified or invalid" }, { status: 400 });
  } catch (error) {
    console.error("Admin API action error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

import { getServerSession } from "next-auth"
import clientPromise from "@/app/lib/mongodb"

export async function GET(req) {
  const session = await getServerSession()
  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = await clientPromise
  const usersCollection = client.db().collection("users")

  const user = await usersCollection.findOne({ email: session.user.email })
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    id: user._id.toString(),
    favorites: user.favorites || [],
    vidLinkProgress: user.vidLinkProgress || {},
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const session = await getServerSession()
  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { favorites, vidLinkProgress } = await req.json()

  const client = await clientPromise
  const usersCollection = client.db().collection("users")

  const result = await usersCollection.updateOne(
    { email: session.user.email },
    { $set: { favorites, vidLinkProgress } },
    { upsert: true }
  )

  if (result.acknowledged) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ error: "Failed to update user data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


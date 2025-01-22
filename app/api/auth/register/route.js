import { hash } from "bcryptjs"
import clientPromise from "@/app/lib/mongodb"

export async function POST(req) {
  try {
    const { name, email, password, favorites, vidLinkProgress } = await req.json()

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise
    const usersCollection = client.db().collection("users")

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await hash(password, 12)
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      favorites,
      vidLinkProgress,
      createdAt: new Date(),
    })

    if (!result.insertedId) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registration error:", error)
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


"use server"

import { hash } from "bcryptjs"
import clientPromise from "@/app/lib/mongodb"

export async function registerUser(formData) {
  const { name, email, password } = Object.fromEntries(formData)

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  const client = await clientPromise
  const usersCollection = client.db().collection("users")

  const existingUser = await usersCollection.findOne({ email })
  if (existingUser) {
    return { error: "User already exists" }
  }

  const hashedPassword = await hash(password, 12)
  const result = await usersCollection.insertOne({
    name,
    email,
    password: hashedPassword,
  })

  if (!result.insertedId) {
    return { error: "Failed to create user" }
  }

  return { success: true }
}


import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/app/lib/mongodb"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const client = await clientPromise
        const usersCollection = client.db().collection("users")

        const user = await usersCollection.findOne({ email: credentials.email })
        if (!user) {
          throw new Error("No user found with this email")
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

export { handler as GET, handler as POST }


// lib/prisma.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  // 1. Change this to the PRIVATE variable name
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // This will now show up in your VERCEL SERVER LOGS if it fails
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // 2. Use the private variable for the pool
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
};

const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

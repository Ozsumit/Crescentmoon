// lib/prisma.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      "NEXT_PUBLIC_DATABASE_URL is missing. Available env vars:",
      Object.keys(process.env).filter((k) => k.includes("DATABASE")),
    );
    throw new Error("NEXT_PUBLIC_DATABASE_URL environment variable is not set");
  }

  console.log(
    "Creating Prisma client with NEXT_PUBLIC_DATABASE_URL:",
    databaseUrl.substring(0, 20) + "...",
  );

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : undefined,
  });
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

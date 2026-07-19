import { neon } from "@neondatabase/serverless";
import { env } from "$env/dynamic/private";

// Fallback to process.env if static dynamic bindings aren't loaded or available
const dbUrl = env.DATABASE_URL || (typeof process !== "undefined" ? process.env.DATABASE_URL : "");

export const sql = dbUrl ? neon(dbUrl) : async (...args) => {
  console.warn("DATABASE_URL is not set. Database features will fallback to dummy mock arrays.");
  return [];
};

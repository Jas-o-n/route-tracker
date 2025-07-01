import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (process.env.NODE_ENV === 'development') {
  console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const client = neon(connectionString);
export const db = drizzle(client, { schema });
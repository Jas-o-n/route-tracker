import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection string would come from environment variables
const connectionString = process.env.DATABASE_URL || "";

// Disable prefetch as it is not supported in some serverless environments
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
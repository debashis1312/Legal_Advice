import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to connect to Neon. Create frontend/.env.local and set DATABASE_URL, or copy frontend/.env.example."
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

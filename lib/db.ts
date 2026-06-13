import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 3,
  idle_timeout: 10,
  connect_timeout: 5,
  max_lifetime: 60,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client, { schema });

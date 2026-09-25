import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;

const FALLBACK_NEON_URL = "postgresql://neondb_owner:npg_ESu1Rdji8HqG@ep-shiny-term-b2gfesht-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";

export function getDb() {
  const connString = process.env.DATABASE_URL || process.env.POSTGRES_URL || FALLBACK_NEON_URL;
  if (!connString) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(connString);
  }
  return sqlClient;
}

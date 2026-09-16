import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  const connString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connString) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(connString);
  }
  return sqlClient;
}

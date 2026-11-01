import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

export function createDatabaseConnection(connectionString?: string) {
  const connStr = connectionString || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kitchensidekick';
  const pool = new Pool({
    connectionString: connStr,
  });

  const db = drizzle(pool, { schema });
  return { db, pool };
}

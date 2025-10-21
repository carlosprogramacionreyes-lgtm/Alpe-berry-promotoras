import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

function getDatabaseConnectionString(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasProductionVars = process.env.DB_HOST_PROD && 
                            process.env.DB_USER_PROD && 
                            process.env.DB_PASS_PROD && 
                            process.env.DB_NAME_PROD;

  if (isProduction || hasProductionVars) {
    const host = process.env.DB_HOST_PROD;
    const port = process.env.DB_PORT_PROD || '5432';
    const user = process.env.DB_USER_PROD;
    const password = process.env.DB_PASS_PROD;
    const database = process.env.DB_NAME_PROD;

    if (!host || !user || !password || !database) {
      throw new Error(
        "Production database configuration incomplete. Required: DB_HOST_PROD, DB_USER_PROD, DB_PASS_PROD, DB_NAME_PROD"
      );
    }

    const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
    console.log(`[DB] Connecting to PRODUCTION database at ${host}:${port}/${database}`);
    return connectionString;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }

  console.log('[DB] Connecting to DEVELOPMENT database');
  return process.env.DATABASE_URL;
}

const connectionString = getDatabaseConnectionString();
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });

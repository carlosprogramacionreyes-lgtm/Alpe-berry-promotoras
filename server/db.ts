import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

/**
 * Database Configuration
 * 
 * This function determines which database to connect to:
 * 1. Production Database (Hostinger VPS): When production environment variables are set
 * 2. Local Development Database (Replit): When using DATABASE_URL
 * 
 * To switch between databases:
 * - For LOCAL testing: Comment out the production check block (lines 18-36)
 * - For PRODUCTION: Ensure DB_HOST_PROD, DB_USER_PROD, DB_PASS_PROD, DB_NAME_PROD are set
 * 
 * Note: Production requires VPS firewall to allow Replit IP addresses
 */
function getDatabaseConnectionString(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasProductionVars = process.env.DB_HOST_PROD && 
                            process.env.DB_USER_PROD && 
                            process.env.DB_PASS_PROD && 
                            process.env.DB_NAME_PROD;

  // PRODUCTION DATABASE (Hostinger VPS)
  // To test locally, comment out this entire block (lines 18-36)
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

  // LOCAL DEVELOPMENT DATABASE (Replit)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }

  console.log('[DB] Connecting to LOCAL DEVELOPMENT database');
  return process.env.DATABASE_URL;
}

const connectionString = getDatabaseConnectionString();
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

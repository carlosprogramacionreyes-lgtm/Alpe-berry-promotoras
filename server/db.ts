import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

/**
 * Database Configuration
 * 
 * Production Setup (VPS):
 * - Application and database run on the SAME VPS server
 * - Database is accessed via localhost (127.0.0.1)
 * - No external database access needed or allowed
 * - Uses DATABASE_URL environment variable
 * 
 * Development Setup (Replit):
 * - Uses local Replit PostgreSQL database
 * - Also uses DATABASE_URL environment variable
 * 
 * Environment Variables:
 * - DATABASE_URL: Connection string for database
 *   Development: postgresql://user:pass@localhost:5432/repl_db (Replit)
 *   Production:  postgresql://alpe_admin:password@localhost:5432/promotoras (VPS)
 * 
 * - SESSION_SECRET: Secret key for session management
 * - NODE_ENV: 'development' or 'production'
 */
function getDatabaseConnectionString(): string {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Please configure your database connection string."
    );
  }

  const env = process.env.NODE_ENV || 'development';
  console.log(`[DB] Environment: ${env}`);
  console.log(`[DB] Connecting to database via DATABASE_URL`);
  
  return process.env.DATABASE_URL;
}

const connectionString = getDatabaseConnectionString();
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

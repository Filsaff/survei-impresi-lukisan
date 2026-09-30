import { Pool, type QueryResult, type QueryResultRow } from 'pg'

const globalForPg = globalThis as unknown as {
  pgPool?: Pool
}

const connectionString = process.env.DATABASE_URL

export const pool: Pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString,
    // AWS RDS default requires SSL or is best used with SSL
    ssl:
      process.env.NODE_ENV === 'production' || connectionString?.includes('rds.amazonaws.com')
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool
}

/**
 * Helper to run single queries using the connection pool
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}

/**
 * Helper to get a dedicated client for multi-statement transactions
 */
export async function getClient() {
  const client = await pool.connect()
  return client
}

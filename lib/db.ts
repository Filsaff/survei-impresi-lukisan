import { Pool, type QueryResult, type QueryResultRow } from 'pg'

const globalForPg = globalThis as unknown as {
  pgPool?: Pool
}

export function getPool(): Pool {
  if (globalForPg.pgPool) {
    return globalForPg.pgPool
  }

  const connectionString = process.env.DATABASE_URL
  const isSsl =
    connectionString?.includes('rds.amazonaws.com') ||
    connectionString?.includes('supabase') ||
    connectionString?.includes('sslmode=require')

  const poolInstance = new Pool({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPg.pgPool = poolInstance
  }

  return poolInstance
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const p = getPool()
    const val = (p as any)[prop]
    return typeof val === 'function' ? val.bind(p) : val
  },
})

/**
 * Helper to run single queries using the connection pool
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params)
}

/**
 * Helper to get a dedicated client for multi-statement transactions
 */
export async function getClient() {
  const client = await getPool().connect()
  return client
}

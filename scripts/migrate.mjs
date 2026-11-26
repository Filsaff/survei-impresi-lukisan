import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const envContent = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > -1 && line.slice(0, idx).trim() === 'DATABASE_URL') {
    dbUrl = line.slice(idx + 1).trim();
    if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
      dbUrl = dbUrl.slice(1, -1);
    }
  }
}

const isSsl = dbUrl.includes('rds.amazonaws.com') || dbUrl.includes('supabase') || dbUrl.includes('sslmode=require');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
});

async function runMigrations() {
  console.log('--- Running Migrations ---');
  const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Applying migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✓ Migration applied successfully: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`✗ Error applying ${file}:`, err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  // Verify created tables
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Current public tables:', tables.rows.map(r => r.table_name));
  await pool.end();
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

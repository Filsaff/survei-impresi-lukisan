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

const isSsl =
  dbUrl.includes('rds.amazonaws.com') ||
  dbUrl.includes('supabase') ||
  dbUrl.includes('sslmode=require');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  console.log('--- Running Migration 007: 580 Paintings with Exclusions & Adult Labels ---');
  const migrationFile = path.join(process.cwd(), 'database', 'migrations', '007_sync_580_paintings_with_exclusions_and_adult_labels.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✓ Migration 007 successfully executed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Migration 007 failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }

  // Quick count verification
  const totalRes = await pool.query('SELECT COUNT(*) as total FROM paintings');
  const adultRes = await pool.query('SELECT COUNT(*) as adult FROM paintings WHERE is_adult_content = TRUE');
  const nonAdultRes = await pool.query('SELECT COUNT(*) as non_adult FROM paintings WHERE is_adult_content = FALSE');

  console.log(`Total paintings in DB: ${totalRes.rows[0].total} (Expected: 567)`);
  console.log(`Adult paintings in DB: ${adultRes.rows[0].adult} (Expected: 39)`);
  console.log(`Non-adult paintings in DB: ${nonAdultRes.rows[0].non_adult} (Expected: 528)`);

  await pool.end();
}

run().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

import fs from 'fs';
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

const pool = new Pool({ connectionString: dbUrl });

async function main() {
  console.log('Running Migration 005: Update Impressions to 38 Standard Impressions...');
  const sql = fs.readFileSync('database/migrations/005_update_impressions_list.sql', 'utf-8');
  await pool.query(sql);
  console.log('✓ Migration 005 applied successfully.\n');

  const res = await pool.query(`
    SELECT id, name 
    FROM impressions 
    ORDER BY (regexp_replace(id, '[^0-9]', '', 'g'))::int ASC;
  `);

  console.log(`Total impressions in database: ${res.rows.length}`);
  console.log('Impressions list:');
  for (const row of res.rows) {
    console.log(`${row.id.padEnd(16)}: ${row.name}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

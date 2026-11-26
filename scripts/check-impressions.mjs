import { Pool } from 'pg';
import fs from 'fs';

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

async function check() {
  const res = await pool.query('SELECT id, name FROM impressions ORDER BY id');
  console.log('Current rows in impressions:', res.rows);

  const constraints = await pool.query(`
    SELECT conname, contype, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'impressions'::regclass
  `);
  console.log('Constraints:', constraints.rows);

  const indexes = await pool.query(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'impressions'
  `);
  console.log('Indexes:', indexes.rows);

  await pool.end();
}

check();

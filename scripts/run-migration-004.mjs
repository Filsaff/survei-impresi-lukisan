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
  console.log('Running Migration 004: Standardize Paintings and Reset Adult Content...');
  const sql = fs.readFileSync('database/migrations/004_standardize_paintings_and_adult_content.sql', 'utf-8');
  await pool.query(sql);
  console.log('✓ Migration 004 applied successfully.');

  const res = await pool.query(`
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE is_adult_content = TRUE) AS adult_count,
      COUNT(*) FILTER (WHERE title NOT LIKE 'Lukisan Budaya Indonesia %') AS non_standard_titles,
      COUNT(*) FILTER (WHERE detail != 'Koleksi seni rupa budaya Nusantara.') AS non_standard_details
    FROM paintings;
  `);

  console.log('Verification Status in Database:');
  console.log(`- Total paintings: ${res.rows[0].total}`);
  console.log(`- Adult content paintings (is_adult_content = TRUE): ${res.rows[0].adult_count}`);
  console.log(`- Non-standard titles: ${res.rows[0].non_standard_titles}`);
  console.log(`- Non-standard details: ${res.rows[0].non_standard_details}`);

  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

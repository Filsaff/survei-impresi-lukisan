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

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('rds.amazonaws.com') || dbUrl.includes('supabase') || dbUrl.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function main() {
  console.log('Running Migration 006: Add allow_adult_content to respondents and survey_sessions...');
  const sql = fs.readFileSync('database/migrations/006_add_allow_adult_content.sql', 'utf-8');
  await pool.query(sql);
  console.log('✓ Migration 006 applied successfully.\n');

  const respColumns = await pool.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'respondents' AND column_name = 'allow_adult_content';
  `);
  console.log('respondents.allow_adult_content column:', respColumns.rows);

  const sessionColumns = await pool.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'survey_sessions' AND column_name = 'allow_adult_content';
  `);
  console.log('survey_sessions.allow_adult_content column:', sessionColumns.rows);

  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

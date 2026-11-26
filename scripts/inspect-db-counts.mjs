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

async function inspect() {
  const tables = [
    'survey_answer_impressions',
    'survey_answers',
    'survey_session_paintings',
    'survey_sessions',
    'respondents',
    'legacy_survey_answers',
    'backup_respondents_pre_dedup',
    'impressions',
    'paintings',
  ];

  console.log('--- Current Database Table Status ---');
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT count(*) FROM "${t}"`);
      console.log(`${t}: ${res.rows[0].count} rows`);
    } catch (e) {
      console.log(`${t}: does not exist or error (${e.message})`);
    }
  }
  await pool.end();
}

inspect();

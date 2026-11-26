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

async function check() {
  const respondents = await pool.query('SELECT id, name, email, created_at FROM respondents');
  console.log('Respondents:', respondents.rows);
  const sessions = await pool.query('SELECT id, respondent_id, status FROM survey_sessions');
  console.log('Sessions count:', sessions.rows.length);
  await pool.end();
}

check().catch(console.error);

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

try {
  const u = new URL(dbUrl);
  console.log('Protocol:', u.protocol, 'Host:', u.host, 'Database:', u.pathname);
  const isSsl = dbUrl.includes('rds.amazonaws.com') || dbUrl.includes('supabase') || dbUrl.includes('sslmode=require');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
  });

  const res = await pool.query('SELECT NOW() AS now, current_database() as db');
  console.log('Connected successfully to DB:', res.rows[0]);
  const latestSessionId = '0541978e-92d1-49fc-8abf-aa10e659f4a4';
  const ssp = await pool.query('SELECT id, session_id, painting_id, display_order FROM survey_session_paintings WHERE session_id = $1 ORDER BY display_order', [latestSessionId]);
  console.log(`Session paintings count for ${latestSessionId}:`, ssp.rows.length);
  console.log('Sample session paintings:', ssp.rows.slice(0, 3));

  const resp = await pool.query('SELECT r.* FROM respondents r JOIN survey_sessions ss ON ss.respondent_id = r.id WHERE ss.id = $1', [latestSessionId]);
  console.log('Respondent for latest session:', resp.rows[0]);
  await pool.end();
} catch (err) {
  console.error('Error connecting to DB:', err.message);
}

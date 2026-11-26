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

const pool = new Pool({ connectionString: dbUrl });

async function resetDatabase() {
  console.log('======================================================');
  console.log('RESETTING SURVEY & RESPONDENT DATABASE TO CLEAN STATE');
  console.log('======================================================\n');

  // Step 1: Backup current respondent data
  console.log('1. Exporting backup before reset...');
  const backupData = {};
  const tablesToBackup = [
    'respondents',
    'survey_sessions',
    'survey_session_paintings',
    'survey_answers',
    'survey_answer_impressions',
    'legacy_survey_answers',
    'backup_respondents_pre_dedup'
  ];

  for (const tableName of tablesToBackup) {
    try {
      const res = await pool.query(`SELECT * FROM "${tableName}"`);
      backupData[tableName] = res.rows;
      console.log(`   - Saved ${res.rows.length} rows from ${tableName}`);
    } catch (err) {
      console.log(`   - Skipped ${tableName} (${err.message})`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(process.cwd(), 'database', 'backups', `backup-before-reset-${timestamp}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✓ Backup saved to: ${backupFilePath}\n`);

  // Step 2: Truncate respondent & survey session tables
  console.log('2. Truncating respondent and survey session tables...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Truncate cascade to safely remove all respondent dependencies
    await client.query(`
      TRUNCATE TABLE 
        survey_answer_impressions,
        survey_answers,
        survey_session_paintings,
        survey_sessions,
        respondents
      CASCADE;
    `);

    // Clean legacy backup tables if they exist
    await client.query(`
      TRUNCATE TABLE legacy_survey_answers;
      TRUNCATE TABLE backup_respondents_pre_dedup;
    `);

    await client.query('COMMIT');
    console.log('✓ Successfully truncated all respondent and survey session tables.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Error during truncate transaction:', err);
    process.exit(1);
  } finally {
    client.release();
  }

  // Step 3: Verify resulting counts
  console.log('3. Verifying database table status post-reset:');
  const verifyTables = [
    'respondents',
    'survey_sessions',
    'survey_session_paintings',
    'survey_answers',
    'survey_answer_impressions',
    'legacy_survey_answers',
    'paintings',
    'impressions'
  ];

  for (const t of verifyTables) {
    const res = await pool.query(`SELECT count(*) FROM "${t}"`);
    const count = parseInt(res.rows[0].count, 10);
    const label = (t === 'paintings' || t === 'impressions') ? '(Master Data Intact)' : '(Cleaned / 0 Respondents)';
    console.log(`   - ${t.padEnd(28)}: ${count} rows ${label}`);
  }

  console.log('\n======================================================');
  console.log('DATABASE RESET COMPLETED SUCCESSFULLY!');
  console.log('======================================================');

  await pool.end();
}

resetDatabase().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});

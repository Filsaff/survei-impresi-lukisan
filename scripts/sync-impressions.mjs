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

const impressions = [
  ['impression-1', 'Tenang'],
  ['impression-2', 'Lembut'],
  ['impression-3', 'Halus'],
  ['impression-4', 'Rinci'],
  ['impression-5', 'Alami'],
  ['impression-6', 'Pedesaan'],
  ['impression-7', 'Tradisional'],
  ['impression-8', 'Etnik'],
  ['impression-9', 'Klasik'],
  ['impression-10', 'Berbudaya'],
  ['impression-11', 'Nostalgis'],
  ['impression-12', 'Emosional'],
  ['impression-13', 'Intens'],
  ['impression-14', 'Membara'],
  ['impression-15', 'Dinamis'],
  ['impression-16', 'Berani'],
  ['impression-17', 'Mencolok'],
  ['impression-18', 'Romantis'],
  ['impression-19', 'Bagai Mimpi'],
  ['impression-20', 'Memikat'],
  ['impression-21', 'Menawan'],
  ['impression-22', 'Anggun'],
  ['impression-23', 'Elegan'],
  ['impression-24', 'Indah'],
  ['impression-25', 'Feminin'],
  ['impression-26', 'Berwibawa'],
  ['impression-27', 'Mulia'],
  ['impression-28', 'Megah'],
  ['impression-29', 'Sedih'],
  ['impression-30', 'Marah'],
  ['impression-31', 'Menakutkan'],
  ['impression-32', 'Menjijikkan'],
  ['impression-33', 'Takjub'],
  ['impression-34', 'Penuh Harapan'],
  ['impression-35', 'Heroik'],
  ['impression-36', 'Spiritual'],
  ['impression-37', 'Reflektif'],
];

async function sync() {
  console.log('--- Syncing Impressions in PostgreSQL ---');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const [id, name] of impressions) {
      await client.query(
        `INSERT INTO impressions (id, name) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [id, name]
      );
    }

    await client.query('COMMIT');
    console.log(`✓ Successfully synced ${impressions.length} impressions.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing impressions:', err);
    process.exit(1);
  } finally {
    client.release();
  }

  const res = await pool.query(`
    SELECT id, name 
    FROM impressions 
    ORDER BY CAST(SUBSTRING(id FROM '([0-9]+)') AS INTEGER) ASC
  `);
  console.log(`Current impressions in DB count: ${res.rows.length}`);
  console.log('First 5:', res.rows.slice(0, 5));
  console.log('Last 5:', res.rows.slice(-5));

  await pool.end();
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Parse command line arguments: e.g. --db="postgresql://..."
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, v] = arg.replace(/^--/, '').split('=');
    return [k, v];
  })
);

let dbUrl = args.db;

if (!dbUrl) {
  // Try reading from .env.local
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    for (const line of envContent.split('\n')) {
      const idx = line.indexOf('=');
      if (idx > -1 && line.slice(0, idx).trim() === 'DATABASE_URL') {
        dbUrl = line.slice(idx + 1).trim();
        if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
          dbUrl = dbUrl.slice(1, -1);
        }
      }
    }
  }
}

if (!dbUrl) {
  console.error('Error: DATABASE_URL not provided. Pass it via --db="postgresql://..."');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('======================================================');
  console.log('DEPLOY & INITIALIZE CLOUD DATABASE');
  console.log(`Target: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);
  console.log('======================================================\n');

  const client = await pool.connect();
  try {
    console.log('1. Applying core schema (tables, constraints, indexes)...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf-8');
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('   ✓ Schema applied successfully.');

    console.log('2. Applying 38 master impressions...');
    const impressionsSql = fs.readFileSync(path.join(process.cwd(), 'database', 'migrations', '005_update_impressions_list.sql'), 'utf-8');
    await client.query('BEGIN');
    await client.query(impressionsSql);
    await client.query('COMMIT');
    console.log('   ✓ 38 Impressions applied successfully.');

    console.log('3. Syncing 580 paintings (13 exclusions, 39 adult labels)...');
    const paintingsSql = fs.readFileSync(path.join(process.cwd(), 'database', 'migrations', '007_sync_580_paintings_with_exclusions_and_adult_labels.sql'), 'utf-8');
    await client.query('BEGIN');
    await client.query(paintingsSql);
    await client.query('COMMIT');
    console.log('   ✓ 580 Paintings synchronized successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Deployment failed during SQL execution:', err);
    process.exit(1);
  } finally {
    client.release();
  }

  console.log('\n4. Verifying database integrity...');
  const totalPaintingsRes = await pool.query('SELECT COUNT(*)::int as count FROM paintings');
  const adultPaintingsRes = await pool.query('SELECT COUNT(*)::int as count FROM paintings WHERE is_adult_content = TRUE');
  const nonAdultPaintingsRes = await pool.query('SELECT COUNT(*)::int as count FROM paintings WHERE is_adult_content = FALSE');
  const totalImpressionsRes = await pool.query('SELECT COUNT(*)::int as count FROM impressions');

  const EXCLUDED = [245, 270, 286, 330, 353, 357, 362, 365, 368, 414, 451, 533, 547];
  const excludedFoundRes = await pool.query(`
    SELECT image_key FROM paintings 
    WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int = ANY($1::int[])
  `, [EXCLUDED]);

  console.log(`   - Total Lukisan Aktif: ${totalPaintingsRes.rows[0].count} (Harus 567)`);
  console.log(`   - Lukisan Dikecualikan Ditemukan: ${excludedFoundRes.rows.length} (Harus 0)`);
  console.log(`   - Lukisan Dewasa (Adult): ${adultPaintingsRes.rows[0].count} (Harus 39)`);
  console.log(`   - Lukisan Non-Dewasa (General): ${nonAdultPaintingsRes.rows[0].count} (Harus 528)`);
  console.log(`   - Total Impresi: ${totalImpressionsRes.rows[0].count} (Harus 38)`);

  const isValid = 
    totalPaintingsRes.rows[0].count === 567 &&
    excludedFoundRes.rows.length === 0 &&
    adultPaintingsRes.rows[0].count === 39 &&
    nonAdultPaintingsRes.rows[0].count === 528 &&
    totalImpressionsRes.rows[0].count === 38;

  console.log('\n======================================================');
  if (isValid) {
    console.log('✓ CLOUD DATABASE INITIALIZED & READY FOR PRODUCTION!');
  } else {
    console.error('✗ INTEGRITY CHECK FAILED! Please verify output above.');
    process.exit(1);
  }
  console.log('======================================================\n');

  await pool.end();
}

main().catch(async (err) => {
  console.error('Fatal error during deployment:', err);
  await pool.end();
  process.exit(1);
});

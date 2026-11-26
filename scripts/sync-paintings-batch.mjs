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

const isSsl =
  dbUrl.includes('rds.amazonaws.com') ||
  dbUrl.includes('supabase') ||
  dbUrl.includes('sslmode=require');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
});

// Official dataset configuration
export const EXCLUDED_PAINTING_NUMBERS = [
  245, 270, 286, 330, 353, 357, 362, 365, 368, 414, 451, 533, 547
];

export const ADULT_PAINTING_NUMBERS = [
  144, 145, 147, 184, 211, 212, 222, 226, 229, 248, 250, 264, 265, 285, 
  321, 324, 331, 339, 355, 359, 433, 449, 463, 464, 488, 489, 494, 497, 
  503, 504, 505, 521, 544, 545, 550, 560, 561, 572, 576
];

// Parse command line arguments: e.g. --from=1 --to=580 --ext=webp
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, v] = arg.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const from = parseInt(args.from || '1', 10);
const to = parseInt(args.to || '580', 10);
const ext = args.ext || 'webp';

async function main() {
  console.log(`\n======================================================`);
  console.log(`SYNC PAINTINGS BATCH TO DATABASE (ROBUST WITH EXCLUSIONS)`);
  console.log(`Rentang nomor: ${from} s/d ${to} (.${ext})`);
  console.log(`Target DB: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`Excluded paintings count: ${EXCLUDED_PAINTING_NUMBERS.length}`);
  console.log(`Adult paintings count: ${ADULT_PAINTING_NUMBERS.length}`);
  console.log(`======================================================\n`);

  const insertQuery = `
    INSERT INTO paintings (title, detail, image_key, is_adult_content)
    SELECT 
        'Lukisan Budaya Indonesia ' || i AS title,
        'Koleksi seni rupa budaya Nusantara.' AS detail,
        i || '.' || $3 AS image_key,
        (i = ANY($5::int[])) AS is_adult_content
    FROM generate_series($1::int, $2::int) AS i
    WHERE 
        i != ALL($4::int[])
        AND NOT EXISTS (
            SELECT 1 FROM paintings WHERE image_key = (i || '.' || $3)
        );
  `;

  const result = await pool.query(insertQuery, [
    from, 
    to, 
    ext, 
    EXCLUDED_PAINTING_NUMBERS, 
    ADULT_PAINTING_NUMBERS
  ]);
  console.log(`✓ Selesai. Sebanyak ${result.rowCount} entri baru ditambahkan (pengecualian & duplikat dilewati).`);

  // Ensure adult content flags are synchronized
  await pool.query(`
    UPDATE paintings
    SET is_adult_content = TRUE
    WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int = ANY($1::int[])
  `, [ADULT_PAINTING_NUMBERS]);

  await pool.query(`
    UPDATE paintings
    SET is_adult_content = FALSE
    WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int != ALL($1::int[])
  `, [ADULT_PAINTING_NUMBERS]);

  const countRes = await pool.query('SELECT COUNT(*) as total FROM paintings;');
  const adultCountRes = await pool.query('SELECT COUNT(*) as adult FROM paintings WHERE is_adult_content = TRUE;');
  const nonAdultCountRes = await pool.query('SELECT COUNT(*) as non_adult FROM paintings WHERE is_adult_content = FALSE;');

  console.log(`\nTotal lukisan aktif di database saat ini: ${countRes.rows[0].total}`);
  console.log(`Total lukisan berlabel Adult: ${adultCountRes.rows[0].adult}`);
  console.log(`Total lukisan berlabel Non-Adult: ${nonAdultCountRes.rows[0].non_adult}`);

  await pool.end();
}

main().catch(async (err) => {
  console.error('Error saat menyinkronkan lukisan:', err);
  await pool.end();
  process.exit(1);
});

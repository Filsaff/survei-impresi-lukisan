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

const EXCLUDED = [245, 270, 286, 330, 353, 357, 362, 365, 368, 414, 451, 533, 547];
const ADULT = [
  144, 145, 147, 184, 211, 212, 222, 226, 229, 248, 250, 264, 265, 285, 
  321, 324, 331, 339, 355, 359, 433, 449, 463, 464, 488, 489, 494, 497, 
  503, 504, 505, 521, 544, 545, 550, 560, 561, 572, 576
];

async function main() {
  console.log('======================================================');
  console.log('INSPEKSI INTEGRITAS DATABASE LUKISAN');
  console.log('======================================================');

  // 1. Total paintings
  const countRes = await pool.query('SELECT COUNT(*)::int as total FROM paintings');
  const total = countRes.rows[0].total;
  console.log(`1. Total lukisan di DB: ${total} (Harus 567) -> ${total === 567 ? '✓ SESUAI' : '✗ TIDAK SESUAI'}`);

  // 2. Check excluded paintings in DB
  const excludedRes = await pool.query(`
    SELECT image_key FROM paintings 
    WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int = ANY($1::int[])
  `, [EXCLUDED]);
  console.log(`2. Lukisan yang seharusnya dihapus ditemukan di DB: ${excludedRes.rows.length} (Harus 0) -> ${excludedRes.rows.length === 0 ? '✓ SESUAI' : '✗ TIDAK SESUAI'}`);
  if (excludedRes.rows.length > 0) {
    console.error('   Ditemukan lukisan yang seharusnya dikecualikan:', excludedRes.rows.map(r => r.image_key));
  }

  // 3. Check adult paintings
  const adultRes = await pool.query(`
    SELECT (regexp_replace(image_key, '[^0-9]', '', 'g'))::int as num 
    FROM paintings 
    WHERE is_adult_content = TRUE 
    ORDER BY num ASC
  `);
  const adultNums = adultRes.rows.map(r => r.num);
  const adultCount = adultNums.length;
  const isAdultExact = adultCount === 39 && JSON.stringify(adultNums) === JSON.stringify(ADULT.slice().sort((a,b)=>a-b));
  console.log(`3. Total lukisan berlabel Adult: ${adultCount} (Harus 39) -> ${isAdultExact ? '✓ SESUAI' : '✗ TIDAK SESUAI'}`);

  // 4. Check non-adult paintings
  const nonAdultRes = await pool.query('SELECT COUNT(*)::int as non_adult FROM paintings WHERE is_adult_content = FALSE');
  const nonAdultCount = nonAdultRes.rows[0].non_adult;
  console.log(`4. Total lukisan berlabel Non-Adult: ${nonAdultCount} (Harus 528) -> ${nonAdultCount === 528 ? '✓ SESUAI' : '✗ TIDAK SESUAI'}`);

  // 5. Check range bounds
  const boundsRes = await pool.query(`
    SELECT 
      MIN((regexp_replace(image_key, '[^0-9]', '', 'g'))::int) as min_num,
      MAX((regexp_replace(image_key, '[^0-9]', '', 'g'))::int) as max_num
    FROM paintings
  `);
  const minNum = boundsRes.rows[0].min_num;
  const maxNum = boundsRes.rows[0].max_num;
  console.log(`5. Rentang nomor lukisan: ${minNum} s/d ${maxNum} (Harus 1 s/d 580) -> ${minNum === 1 && maxNum === 580 ? '✓ SESUAI' : '✗ TIDAK SESUAI'}`);

  // 6. Check title and detail format consistency
  const badFormatRes = await pool.query(`
    SELECT COUNT(*)::int as bad_count 
    FROM paintings 
    WHERE title NOT LIKE 'Lukisan Budaya Indonesia %' OR detail != 'Koleksi seni rupa budaya Nusantara.'
  `);
  const badCount = badFormatRes.rows[0].bad_count;
  console.log(`6. Inkonsistensi format judul/detail: ${badCount} (Harus 0) -> ${badCount === 0 ? '✓ SESUAI' : '✗ TIDAK SESUAI'}`);

  console.log('======================================================');
  const allValid = total === 567 && excludedRes.rows.length === 0 && isAdultExact && nonAdultCount === 528 && minNum === 1 && maxNum === 580 && badCount === 0;
  console.log(`KESIMPULAN: ${allValid ? 'SEMUA SYARAT TERPENUHI DENGAN SEMPURNA ✓' : 'ADA KESALAHAN ✗'}`);
  console.log('======================================================');

  await pool.end();
  if (!allValid) process.exit(1);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

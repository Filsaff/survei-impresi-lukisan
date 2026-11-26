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

process.env.DATABASE_URL = dbUrl;

const isSsl = dbUrl.includes('rds.amazonaws.com') || dbUrl.includes('supabase') || dbUrl.includes('sslmode=require');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
});

// Dynamically import repository after process.env is configured
const { surveyDbRepository } = await import('../data/survey-db-repository.ts');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('SURVEY BACKEND TEST SUITE (PostgreSQL & Business Rules)');
  console.log('======================================================\n');

  // Clean test fixtures before starting
  await pool.query(`
    DELETE FROM survey_answer_impressions 
    WHERE answer_id IN (
      SELECT sa.id FROM survey_answers sa 
      JOIN survey_session_paintings ssp ON ssp.id = sa.session_painting_id
      JOIN survey_sessions ss ON ss.id = ssp.session_id 
      JOIN respondents r ON r.id = ss.respondent_id 
      WHERE r.email LIKE 'test_%@example.com' OR r.email LIKE 'concurrent_%@example.com'
    );
    DELETE FROM survey_answers 
    WHERE session_painting_id IN (
      SELECT ssp.id FROM survey_session_paintings ssp
      JOIN survey_sessions ss ON ss.id = ssp.session_id 
      JOIN respondents r ON r.id = ss.respondent_id 
      WHERE r.email LIKE 'test_%@example.com' OR r.email LIKE 'concurrent_%@example.com'
    );
    DELETE FROM survey_session_paintings 
    WHERE session_id IN (
      SELECT ss.id FROM survey_sessions ss 
      JOIN respondents r ON r.id = ss.respondent_id 
      WHERE r.email LIKE 'test_%@example.com' OR r.email LIKE 'concurrent_%@example.com'
    );
    DELETE FROM survey_sessions 
    WHERE respondent_id IN (
      SELECT id FROM respondents 
      WHERE email LIKE 'test_%@example.com' OR email LIKE 'concurrent_%@example.com'
    );
    DELETE FROM respondents 
    WHERE email LIKE 'test_%@example.com' OR email LIKE 'concurrent_%@example.com';
  `);

  // --------------------------------------------------------------------------
  // TEST 1: Adult Content Filtering (<18 vs >=18)
  // --------------------------------------------------------------------------
  console.log('TEST 1: Adult Content Filtering');
  let adultResult;
  const underageResp = {
    name: 'Anak Remaja',
    email: 'test_underage@example.com',
    age: 15,
    gender: 'Laki-laki',
    education: 'SMA',
  };

  const underageResult = await surveyDbRepository.startOrResumeSession(underageResp);
  assert(underageResult.success === true, 'Underage session started successfully');
  assert(underageResult.session.paintings.length === 20, 'Allocated exactly 20 paintings for underage respondent');

  // Verify adult paintings are strictly filtered out for underage respondent
  const adultPaintingsInDb = await pool.query('SELECT id FROM paintings WHERE is_adult_content = TRUE');
  const adultIds = new Set(adultPaintingsInDb.rows.map(r => r.id));
  const underageHasAdult = underageResult.session.paintings.some(p => adultIds.has(p.paintingId));
  assert(!underageHasAdult, 'Underage respondent received 0 adult paintings (Adult content strictly filtered)');

  // Test Adult Respondent (age >= 18)
  const adultResp = {
    name: 'Dewasa Test',
    email: 'test_adult@example.com',
    age: 25,
    gender: 'Perempuan',
    education: 'S1',
  };
  adultResult = await surveyDbRepository.startOrResumeSession(adultResp);
  assert(adultResult.success === true, 'Adult session started successfully');
  assert(adultResult.session.paintings.length === 20, 'Allocated 20 paintings for adult respondent');

  // --------------------------------------------------------------------------
  // TEST 2: Resume Survey by Email
  // --------------------------------------------------------------------------
  console.log('\nTEST 2: Resume Survey by Email');
  const resumeResult = await surveyDbRepository.startOrResumeSession({
    name: 'Dewasa Test Different Name',
    email: 'test_adult@example.com',
    age: 26,
    gender: 'Perempuan',
    education: 'S1',
  });
  assert(resumeResult.resumed === true, 'Session resumed with same email');
  assert(resumeResult.session.id === adultResult.session.id, 'Resumed session ID matches original session');
  assert(resumeResult.session.paintings.length === 20, 'Preserved 20 allocated paintings on resume');

  // --------------------------------------------------------------------------
  // TEST 3: Answer Persistence and Idempotency
  // --------------------------------------------------------------------------
  console.log('\nTEST 3: Answer Persistence and Idempotency');
  const testSession = adultResult.session;
  const painting1 = testSession.paintings[0];

  const saveRes1 = await surveyDbRepository.saveAnswer({
    sessionId: testSession.id,
    sessionPaintingId: painting1.sessionPaintingId,
    impressionIds: ['impression-1', 'impression-2'],
  });
  assert(saveRes1.success === true, 'First answer saved successfully');
  assert(saveRes1.answeredCount === 1, 'Answered count incremented to 1');
  assert(Array.isArray(saveRes1.serverAnswers) && saveRes1.serverAnswers.length === 20, 'serverAnswers returns authoritative snapshot of 20 paintings');
  assert(saveRes1.nextUnansweredPosition === 2, 'nextUnansweredPosition points to painting 2');

  // Duplicate / Retry save with same impressions (idempotent)
  const saveRes2 = await surveyDbRepository.saveAnswer({
    sessionId: testSession.id,
    sessionPaintingId: painting1.sessionPaintingId,
    impressionIds: ['impression-1', 'impression-2'],
  });
  assert(saveRes2.success === true, 'Duplicate answer save succeeded idempotently');
  assert(saveRes2.answeredCount === 1, 'Answered count remains 1 (no duplicate answer rows)');

  // Verify DB rows for answers
  const dbAnswers = await pool.query('SELECT COUNT(*) FROM survey_answers WHERE session_painting_id = $1', [painting1.sessionPaintingId]);
  assert(parseInt(dbAnswers.rows[0].count) === 1, 'Exact 1 record in survey_answers table');

  // Update impressions for same painting
  const saveRes3 = await surveyDbRepository.saveAnswer({
    sessionId: testSession.id,
    sessionPaintingId: painting1.sessionPaintingId,
    impressionIds: ['impression-4', 'impression-6', 'impression-8'],
  });
  assert(saveRes3.success === true, 'Updated impressions for painting saved');
  const dbImpressions = await pool.query(`
    SELECT sai.impression_id 
    FROM survey_answer_impressions sai
    JOIN survey_answers sa ON sa.id = sai.answer_id
    WHERE sa.session_painting_id = $1
    ORDER BY sai.impression_id
  `, [painting1.sessionPaintingId]);
  const savedImpIds = dbImpressions.rows.map(r => r.impression_id);
  assert(
    savedImpIds.join(',') === 'impression-4,impression-6,impression-8',
    'Impressions synced correctly to updated choices'
  );

  // --------------------------------------------------------------------------
  // TEST 4: 24h Session Expiration Handling
  // --------------------------------------------------------------------------
  console.log('\nTEST 4: 24-Hour Session Expiration Handling');
  // Create an expired session by updating expires_at to 2 hours ago
  await pool.query(`
    UPDATE survey_sessions 
    SET expires_at = CURRENT_TIMESTAMP - INTERVAL '2 hours'
    WHERE id = $1
  `, [testSession.id]);

  const currentCheck = await surveyDbRepository.getCurrentSession(testSession.id);
  assert(currentCheck.expired === true, 'Expired session detected as expired (TTL passed)');

  // Starting again with same email after expiration should create a NEW session
  const postExpireResult = await surveyDbRepository.startOrResumeSession({
    name: 'Dewasa Test',
    email: 'test_adult@example.com',
    age: 25,
    gender: 'Perempuan',
    education: 'S1',
  });
  assert(postExpireResult.resumed === false, 'New session created after expiration instead of resuming');
  assert(postExpireResult.session.id !== testSession.id, 'New session has fresh unique ID');

  // Verify that painting1 (which was answered in old session) is NOT in the new session!
  const hasPainting1Again = postExpireResult.session.paintings.some(p => p.paintingId === painting1.paintingId);
  assert(!hasPainting1Again, 'Painting answered in abandoned session is permanently excluded from new session (AC-09/AC-02)');

  // --------------------------------------------------------------------------
  // TEST 5: Complete Survey Endpoint & Answer Immutability
  // --------------------------------------------------------------------------
  console.log('\nTEST 5: Survey Completion & Post-Completion Immutability');
  const freshSession = postExpireResult.session;

  // Attempting complete when not all paintings answered should throw error
  let completeErrorThrown = false;
  try {
    await surveyDbRepository.completeSurvey({ sessionId: freshSession.id });
  } catch (err) {
    completeErrorThrown = true;
  }
  assert(completeErrorThrown, 'Cannot complete session before all 20 paintings are answered');

  // Answer all 20 paintings
  for (const p of freshSession.paintings) {
    await surveyDbRepository.saveAnswer({
      sessionId: freshSession.id,
      sessionPaintingId: p.sessionPaintingId,
      impressionIds: ['impression-1'],
    });
  }

  const completeRes = await surveyDbRepository.completeSurvey({ sessionId: freshSession.id });
  assert(completeRes.success === true, 'Survey successfully marked COMPLETED when all 20 answered');

  // Attempting to save another answer after completion should fail
  let postCompleteError = false;
  try {
    await surveyDbRepository.saveAnswer({
      sessionId: freshSession.id,
      sessionPaintingId: freshSession.paintings[0].sessionPaintingId,
      impressionIds: ['impression-5'],
    });
  } catch (err) {
    postCompleteError = true;
  }
  assert(postCompleteError, 'Completed session rejects new or updated answers (Immutability preserved)');

  // --------------------------------------------------------------------------
  // TEST 6: Concurrency and Allocation Locking
  // --------------------------------------------------------------------------
  console.log('\nTEST 6: Concurrency and Atomic Allocation');
  // Simulate 6 users starting simultaneously in parallel
  const parallelUsers = Array.from({ length: 6 }, (_, i) => ({
    name: `User Concurrent ${i + 1}`,
    email: `concurrent_${i + 1}_${Date.now()}@example.com`,
    age: 22,
    gender: 'Laki-laki',
    education: 'S1',
  }));

  const startTime = Date.now();
  const parallelResults = await Promise.all(
    parallelUsers.map(u => surveyDbRepository.startOrResumeSession(u))
  );
  const elapsed = Date.now() - startTime;

  assert(parallelResults.every(r => r.success), 'All concurrent start requests succeeded');
  assert(parallelResults.every(r => r.session.paintings.length === 20), 'Each concurrent user received exactly 20 paintings');
  console.log(`  ℹ 6 parallel allocation transactions completed in ${elapsed}ms (avg ${(elapsed / 6).toFixed(1)}ms per user)`);

  // Verify that paintings are distributed across users (not identical 20 paintings for everyone)
  const session1Paintings = new Set(parallelResults[0].session.paintings.map(p => p.paintingId));
  const session2Paintings = new Set(parallelResults[1].session.paintings.map(p => p.paintingId));
  const overlap = [...session1Paintings].filter(id => session2Paintings.has(id)).length;
  assert(overlap < 20, `Concurrent users received dispersed painting allocations (${overlap}/20 overlap, no robotic clustering)`);

  // --------------------------------------------------------------------------
  // TEST 7: Adult Content Allocation Filtering & Opt-In/Opt-Out Rule
  // --------------------------------------------------------------------------
  console.log('\nTEST 7: Adult Content Allocation & Preference Enforcement');

  // Verify that official adult paintings exist in the database (39 items)
  const adultPaintingsCountRes = await pool.query(`SELECT COUNT(*)::int as count FROM paintings WHERE is_adult_content = TRUE`);
  assert(adultPaintingsCountRes.rows[0].count === 39, 'Master database contains exactly 39 official adult paintings');

  // 7A: Under-age respondent (< 18) with allowAdultContent = true (Must be ignored, 0 adult paintings)
  const underageStart = await surveyDbRepository.startOrResumeSession({
    name: 'Remaja Test',
    email: `test_underage_${Date.now()}@example.com`,
    age: 16,
    gender: 'Laki-laki',
    education: 'SMA / sederajat',
    allowAdultContent: true,
  });
  const underageAllocatedAdults = await pool.query(`
    SELECT p.id FROM survey_session_paintings ssp
    JOIN paintings p ON p.id = ssp.painting_id
    WHERE ssp.session_id = $1 AND p.is_adult_content = TRUE
  `, [underageStart.session.id]);
  assert(underageAllocatedAdults.rows.length === 0, 'Under-age respondent (< 18) strictly received 0 adult paintings');

  // 7B: Adult respondent (>= 18) with allowAdultContent = false (Opt-out, 0 adult paintings)
  const adultOptOutStart = await surveyDbRepository.startOrResumeSession({
    name: 'Dewasa Opt-Out',
    email: `test_optout_${Date.now()}@example.com`,
    age: 26,
    gender: 'Perempuan',
    education: 'S1',
    allowAdultContent: false,
  });
  const optOutAllocatedAdults = await pool.query(`
    SELECT p.id FROM survey_session_paintings ssp
    JOIN paintings p ON p.id = ssp.painting_id
    WHERE ssp.session_id = $1 AND p.is_adult_content = TRUE
  `, [adultOptOutStart.session.id]);
  assert(optOutAllocatedAdults.rows.length === 0, 'Adult respondent opting out (allowAdultContent = false) strictly received 0 adult paintings');

  // 7C: Adult respondent (>= 18) with allowAdultContent = true (Opt-in, adult paintings permitted)
  const adultOptInStart = await surveyDbRepository.startOrResumeSession({
    name: 'Dewasa Opt-In',
    email: `test_optin_${Date.now()}@example.com`,
    age: 26,
    gender: 'Laki-laki',
    education: 'S1',
    allowAdultContent: true,
  });
  assert(adultOptInStart.session.paintings.length === 20, 'Adult opt-in session created successfully with 20 paintings');

  // Verify respondent table stores allow_adult_content correctly
  const respCheck = await pool.query(`
    SELECT allow_adult_content FROM respondents WHERE id = $1
  `, [adultOptInStart.session.respondentId]);
  assert(respCheck.rows[0].allow_adult_content === true, 'respondents.allow_adult_content persisted as TRUE');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  await pool.end();
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (err) => {
  console.error('Test suite failed with unexpected error:', err);
  await pool.end();
  process.exit(1);
});

/**
 * Automated Security Validation Test Suite
 * Tests input sanitization, anti-XSS, honeypot traps, email rules, rate limiting, and UUID validation.
 */

import {
  validateEmail,
  sanitizeName,
  validateRespondentInput,
  isValidUuid,
  validateSaveAnswerInput,
  isPayloadTooLarge,
} from '../lib/sanitizer.ts'

import { checkRateLimit } from '../lib/rate-limiter.ts'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

console.log('\n======================================================')
console.log('SURVEY SECURITY & SANITIZATION TEST SUITE')
console.log('======================================================\n')

// -----------------------------------------------------------------------------
// TEST 1: Strict Email Username Validation (Letters and Dots only)
// -----------------------------------------------------------------------------
console.log('TEST 1: Email Username Rule (Letters & Dots Only)')

const validEmails = [
  'john.doe@gmail.com',
  'budi.santoso@pens.ac.id',
  'filsaf@domain.com',
  'nama.pertama.nama.kedua@sub.domain.co.id',
]

for (const email of validEmails) {
  const res = validateEmail(email)
  assert(res.valid === true, `Valid email accepted: ${email}`)
}

const invalidEmails = [
  { email: 'user123@gmail.com', reason: 'Contains numbers in username' },
  { email: 'user_test@gmail.com', reason: 'Contains underscore in username' },
  { email: 'user+test@gmail.com', reason: 'Contains plus tag in username' },
  { email: '.user@gmail.com', reason: 'Leading dot in username' },
  { email: 'user.@gmail.com', reason: 'Trailing dot in username' },
  { email: 'user..name@gmail.com', reason: 'Consecutive dots in username' },
  { email: 'user<script>@gmail.com', reason: 'Script tag in username' },
  { email: 'invalid-email', reason: 'Missing @ symbol' },
]

for (const item of invalidEmails) {
  const res = validateEmail(item.email)
  assert(res.valid === false, `Invalid email rejected (${item.reason}): ${item.email}`)
}

// -----------------------------------------------------------------------------
// TEST 2: Name Sanitization & Anti-XSS & Anti-Formula Injection
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Name Sanitization, Anti-XSS & Anti-Formula Injection')

const xssName = '<script>alert("hack")</script>Budi Santoso'
const xssResult = sanitizeName(xssName)
assert(xssResult.valid === true && xssResult.data === 'Budi Santoso', 'Stripped <script> tags from name')

const formulaName = '=Budi Santoso'
const formulaResult = sanitizeName(formulaName)
assert(formulaResult.valid === true && formulaResult.data === 'Budi Santoso', 'Stripped dangerous formula injection prefix (=) and kept clean name')

const maliciousFormula = '=cmd|\' /C calc\'!A0Budi'
assert(sanitizeName(maliciousFormula).valid === false, 'Rejected malicious formula with shell command characters')

const shortNameResult = sanitizeName('A')
assert(shortNameResult.valid === false, 'Rejected too-short name (< 2 chars)')

const longNameResult = sanitizeName('A'.repeat(101))
assert(longNameResult.valid === false, 'Rejected too-long name (> 100 chars)')

// -----------------------------------------------------------------------------
// TEST 3: Respondent Input Validation
// -----------------------------------------------------------------------------
console.log('\nTEST 3: Respondent Input Validation')

const normalHumanSubmission = {
  name: 'Ahmad Dahlan',
  email: 'ahmad.dahlan@pens.ac.id',
  age: 22,
  gender: 'Laki-laki',
  education: 'S1',
}
const humanResult = validateRespondentInput(normalHumanSubmission)
assert(humanResult.valid === true, 'Normal human respondent input accepted')

const invalidGenderSubmission = {
  ...normalHumanSubmission,
  gender: 'Alien',
}
const invalidGenderResult = validateRespondentInput(invalidGenderSubmission)
assert(invalidGenderResult.valid === false && invalidGenderResult.code === 'INVALID_GENDER', 'Invalid gender rejected')

// -----------------------------------------------------------------------------
// TEST 4: UUID v4 Validation
// -----------------------------------------------------------------------------
console.log('\nTEST 4: UUID v4 Format Validation')

assert(isValidUuid('550e8400-e29b-41d4-a716-446655440000') === true, 'Standard UUID v4 accepted')
assert(isValidUuid("' OR 1=1 --") === false, 'SQL Injection string rejected as UUID')
assert(isValidUuid('invalid-short-string') === false, 'Malformed string rejected as UUID')
assert(isValidUuid('') === false, 'Empty string rejected as UUID')

// -----------------------------------------------------------------------------
// TEST 5: Save Answer Input Validation
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Save Answer Input Bounds & Whitelisting')

const validAnswer = {
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  sessionPaintingId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
  impressionIds: ['impression-1', 'impression-2'],
}
const validAnswerRes = validateSaveAnswerInput(validAnswer)
assert(validAnswerRes.valid === true, 'Valid answer input accepted')

const emptyImpressions = {
  ...validAnswer,
  impressionIds: [],
}
assert(validateSaveAnswerInput(emptyImpressions).valid === false, 'Empty impression array rejected')

const tooManyImpressions = {
  ...validAnswer,
  impressionIds: Array.from({ length: 40 }, (_, i) => `imp-${i}`),
}
assert(validateSaveAnswerInput(tooManyImpressions).valid === false, 'Exceeded impression count (> 38) rejected')

const maliciousImpressionId = {
  ...validAnswer,
  impressionIds: ['<script>alert(1)</script>'],
}
assert(validateSaveAnswerInput(maliciousImpressionId).valid === false, 'Malicious impression ID string rejected')

// -----------------------------------------------------------------------------
// TEST 6: In-Memory Sliding-Window Rate Limiter
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Sliding-Window Rate Limiter')

const testKey = `test_ip_${Date.now()}`
const testLimit = 5
const testWindow = 10 // 10 seconds

for (let i = 1; i <= testLimit; i++) {
  const r = checkRateLimit(testKey, testLimit, testWindow)
  assert(r.allowed === true && r.current === i, `Request ${i}/${testLimit} allowed`)
}

// Request #6 must be blocked
const blockedRes = checkRateLimit(testKey, testLimit, testWindow)
assert(blockedRes.allowed === false, 'Request #6 blocked by rate limiter')
assert(blockedRes.retryAfterSeconds > 0, `Returns valid retryAfterSeconds (${blockedRes.retryAfterSeconds}s)`)

// -----------------------------------------------------------------------------
// TEST 7: Payload Size Guard
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Payload Size Guard (Anti-DoS)')

const normalReq = new Request('http://localhost', {
  headers: { 'content-length': '1024' }, // 1KB
})
assert(isPayloadTooLarge(normalReq) === false, 'Normal 1KB payload allowed')

const hugeReq = new Request('http://localhost', {
  headers: { 'content-length': '50000' }, // 50KB > 32KB
})
assert(isPayloadTooLarge(hugeReq) === true, 'Oversized 50KB payload blocked (HTTP 413)')

// -----------------------------------------------------------------------------
// TEST 8: Adult / Nude Content Preference Sanitization & Anti-Tamper
// -----------------------------------------------------------------------------
console.log('\nTEST 8: Adult / Nude Content Preference (18+ Rule & Anti-Tamper)')

// Underage respondent attempting to enable adult content must be forced to false
const underagePayload = {
  name: 'Budi Santoso',
  email: 'budi.santoso@pens.ac.id',
  gender: 'Laki-laki',
  age: 16,
  education: 'SMA / sederajat',
  allowAdultContent: true,
}
const underageRes = validateRespondentInput(underagePayload)
assert(underageRes.valid === true, 'Underage respondent input accepted')
assert(underageRes.valid === true && underageRes.data.allowAdultContent === false, 'Underage respondent (< 18) forced to allowAdultContent = false')

// Adult respondent (>= 18) opting in retains true
const adultOptInPayload = {
  ...underagePayload,
  age: 21,
  allowAdultContent: true,
}
const adultOptInRes = validateRespondentInput(adultOptInPayload)
assert(adultOptInRes.valid === true && adultOptInRes.data.allowAdultContent === true, 'Adult respondent (>= 18) opting in keeps allowAdultContent = true')

// Adult respondent (>= 18) opting out retains false
const adultOptOutPayload = {
  ...underagePayload,
  age: 21,
  allowAdultContent: false,
}
const adultOptOutRes = validateRespondentInput(adultOptOutPayload)
assert(adultOptOutRes.valid === true && adultOptOutRes.data.allowAdultContent === false, 'Adult respondent (>= 18) opting out keeps allowAdultContent = false')

console.log('\n======================================================')
console.log(`SECURITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
console.log('======================================================\n')

if (failed > 0) {
  process.exit(1)
} else {
  process.exit(0)
}

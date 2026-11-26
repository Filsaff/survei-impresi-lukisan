/**
 * Input Validation & Security Sanitizer
 * Mitigates XSS, CSV Formula Injection, Malformed Payloads, and Bot Invasions.
 */

import type { Respondent } from '@/domain/survey'

export interface ValidationSuccess<T> {
  valid: true
  data: T
}

export interface ValidationError {
  valid: false
  error: string
  code: string
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError

export const ALLOWED_GENDERS = ['Laki-laki', 'Perempuan'] as const
export const ALLOWED_EDUCATIONS = [
  'SD',
  'SMP',
  'SMA',
  'SMA / sederajat',
  'D3',
  'S1',
  'S2',
  'S3',
  'S2 / S3',
] as const

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const IMPRESSION_ID_REGEX = /^[a-zA-Z0-9_-]{1,50}$/

/**
 * Validates email strictly according to requirement:
 * The username (local-part before '@') must contain ONLY letters and dots (no numbers or special characters).
 * Example: 'john.doe@gmail.com', 'budi.santoso@pens.ac.id'
 */
export function validateEmail(rawEmail: unknown): ValidationResult<string> {
  if (typeof rawEmail !== 'string') {
    return {
      valid: false,
      error: 'Format email harus berupa teks.',
      code: 'INVALID_EMAIL_TYPE',
    }
  }

  const email = rawEmail.trim().toLowerCase()

  if (!email || email.length > 100) {
    return {
      valid: false,
      error: 'Email tidak boleh kosong dan maksimal 100 karakter.',
      code: 'INVALID_EMAIL_LENGTH',
    }
  }

  const parts = email.split('@')
  if (parts.length !== 2) {
    return {
      valid: false,
      error: 'Format email harus mengandung satu simbol @.',
      code: 'INVALID_EMAIL_FORMAT',
    }
  }

  const [username, domain] = parts

  // Local-part rule: strictly letters (a-z) and dots (.), no numbers or special symbols
  // Must start and end with a letter, no consecutive dots (..)
  const usernameLetterDotRegex = /^[a-z]+(?:\.[a-z]+)*$/
  if (!usernameLetterDotRegex.test(username)) {
    return {
      valid: false,
      error:
        'Nama pengguna email (sebelum @) hanya boleh berupa huruf dan titik (tanpa angka atau simbol lain).',
      code: 'INVALID_EMAIL_USERNAME',
    }
  }

  // Domain rule: standard domain format (e.g. gmail.com, pens.ac.id)
  const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/
  if (!domainRegex.test(domain) || domain.includes('..')) {
    return {
      valid: false,
      error: 'Nama domain email tidak valid.',
      code: 'INVALID_EMAIL_DOMAIN',
    }
  }

  return { valid: true, data: email }
}

/**
 * Strips HTML tags, script elements, control characters, and CSV formula injection prefixes.
 */
export function sanitizeName(rawName: unknown): ValidationResult<string> {
  if (typeof rawName !== 'string') {
    return {
      valid: false,
      error: 'Nama responden harus berupa teks.',
      code: 'INVALID_NAME_TYPE',
    }
  }

  // 1. Strip script tags and their inner content completely
  let cleaned = rawName.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  )

  // 2. Strip any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '')

  // 3. Remove dangerous CSV/Excel formula injection prefixes if any (=, +, -, @, \t, \r)
  cleaned = cleaned.replace(/^[=+\-@\t\r]+/, '')

  // 4. Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  if (cleaned.length < 2 || cleaned.length > 100) {
    return {
      valid: false,
      error: 'Nama responden harus terdiri dari 2 hingga 100 karakter.',
      code: 'INVALID_NAME_LENGTH',
    }
  }

  // Allow letters, spaces, and standard name punctuation (' . , -)
  const nameRegex = /^[a-zA-Z\s'.,-]+$/
  if (!nameRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Nama hanya boleh mengandung huruf, spasi, dan tanda baca nama standar.',
      code: 'INVALID_NAME_CHARACTERS',
    }
  }

  return { valid: true, data: cleaned }
}

/**
 * Validates and sanitizes a complete Respondent submission.
 */
export function validateRespondentInput(
  rawBody: any
): ValidationResult<Respondent> {
  if (!rawBody || typeof rawBody !== 'object') {
    return {
      valid: false,
      error: 'Payload data responden tidak valid.',
      code: 'INVALID_BODY',
    }
  }

  // 1. Validate Name
  const nameResult = sanitizeName(rawBody.name)
  if (!nameResult.valid) return nameResult

  // 2. Validate Email
  const emailResult = validateEmail(rawBody.email)
  if (!emailResult.valid) return emailResult

  // 4. Validate Age
  const rawAge = Number(rawBody.age)
  if (!rawBody.age || isNaN(rawAge) || rawAge < 1 || rawAge > 120) {
    return {
      valid: false,
      error: 'Usia responden harus berupa angka valid antara 1 hingga 120 tahun.',
      code: 'INVALID_AGE',
    }
  }

  // 5. Validate Gender
  const gender = rawBody.gender?.trim()
  if (gender && !ALLOWED_GENDERS.includes(gender as any)) {
    return {
      valid: false,
      error: 'Pilihan jenis kelamin tidak valid.',
      code: 'INVALID_GENDER',
    }
  }

  // 6. Validate Education
  const education = rawBody.education?.trim()
  if (education && !ALLOWED_EDUCATIONS.includes(education as any)) {
    return {
      valid: false,
      error: 'Pilihan jenjang pendidikan tidak valid.',
      code: 'INVALID_EDUCATION',
    }
  }

  // 7. Validate & Sanitize Adult Content Preference
  // Anti-tampering rule: Only respondents aged >= 18 may enable adult content.
  // If age < 18, allowAdultContent is strictly forced to false.
  const normalizedAge = Math.floor(rawAge)
  const allowAdultContent = Boolean(rawBody.allowAdultContent && normalizedAge >= 18)

  return {
    valid: true,
    data: {
      name: nameResult.data,
      email: emailResult.data,
      age: normalizedAge,
      gender: gender || 'Laki-laki',
      education: education || 'S1',
      allowAdultContent,
    },
  }
}

/**
 * Validates UUID v4 format
 */
export function isValidUuid(id: unknown): boolean {
  if (typeof id !== 'string') return false
  return UUID_V4_REGEX.test(id.trim())
}

/**
 * Validates SaveAnswerInput (sessionId, sessionPaintingId, impressionIds)
 */
export function validateSaveAnswerInput(rawBody: any): ValidationResult<{
  sessionId: string
  sessionPaintingId: string
  impressionIds: string[]
}> {
  if (!rawBody || typeof rawBody !== 'object') {
    return {
      valid: false,
      error: 'Payload jawaban tidak valid.',
      code: 'INVALID_PAYLOAD',
    }
  }

  const { sessionId, sessionPaintingId, impressionIds } = rawBody

  if (!isValidUuid(sessionId)) {
    return {
      valid: false,
      error: 'Format sessionId tidak valid (harus berupa UUID v4).',
      code: 'INVALID_SESSION_ID',
    }
  }

  if (!isValidUuid(sessionPaintingId)) {
    return {
      valid: false,
      error: 'Format sessionPaintingId tidak valid (harus berupa UUID v4).',
      code: 'INVALID_SESSION_PAINTING_ID',
    }
  }

  if (!Array.isArray(impressionIds) || impressionIds.length === 0) {
    return {
      valid: false,
      error: 'Pilihan kata impresi tidak boleh kosong.',
      code: 'EMPTY_IMPRESSIONS',
    }
  }

  if (impressionIds.length > 38) {
    return {
      valid: false,
      error: 'Jumlah pilihan impresi melebihi batas maksimal (38 kata).',
      code: 'IMPRESSIONS_LIMIT_EXCEEDED',
    }
  }

  // Validate every impression ID against whitelist pattern
  const sanitizedIds: string[] = []
  for (const item of impressionIds) {
    if (typeof item !== 'string' || !IMPRESSION_ID_REGEX.test(item.trim())) {
      return {
        valid: false,
        error: `Format ID impresi tidak valid: ${String(item).slice(0, 20)}`,
        code: 'INVALID_IMPRESSION_ID_FORMAT',
      }
    }
    sanitizedIds.push(item.trim())
  }

  return {
    valid: true,
    data: {
      sessionId: sessionId.trim(),
      sessionPaintingId: sessionPaintingId.trim(),
      impressionIds: Array.from(new Set(sanitizedIds)),
    },
  }
}

/**
 * Validates CompleteSurveyInput
 */
export function validateCompleteSurveyInput(
  rawBody: any
): ValidationResult<{ sessionId: string }> {
  if (!rawBody || typeof rawBody !== 'object') {
    return {
      valid: false,
      error: 'Payload tidak valid.',
      code: 'INVALID_PAYLOAD',
    }
  }

  const { sessionId } = rawBody

  if (!isValidUuid(sessionId)) {
    return {
      valid: false,
      error: 'Format sessionId tidak valid (harus berupa UUID v4).',
      code: 'INVALID_SESSION_ID',
    }
  }

  return {
    valid: true,
    data: { sessionId: sessionId.trim() },
  }
}

/**
 * Checks request payload size to prevent memory exhaustion DoS (max 32KB)
 */
export function isPayloadTooLarge(request: Request, maxBytes = 32768): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return true
  }
  return false
}

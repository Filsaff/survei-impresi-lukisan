-- ==============================================================================
-- Schema Database Survei Impresi Lukisan Budaya
-- Engine: PostgreSQL 14+ (Cocok untuk AWS RDS / Supabase / Local PostgreSQL)
-- Source of Truth: docs/survey-backend-prd.md
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Responden
CREATE TABLE IF NOT EXISTS respondents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 1 AND age <= 120),
    education VARCHAR(100) NOT NULL,
    allow_adult_content BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_respondents_email_lower ON respondents (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_respondents_created_at ON respondents (created_at);
CREATE INDEX IF NOT EXISTS idx_respondents_allow_adult_content ON respondents (allow_adult_content);

-- 2. Tabel Master Lukisan (~500 Lukisan)
CREATE TABLE IF NOT EXISTS paintings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    detail TEXT,
    image_key VARCHAR(512) NOT NULL,
    is_adult_content BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_paintings_adult_content ON paintings (is_adult_content);

-- 3. Tabel Master Impresi
CREATE TABLE IF NOT EXISTS impressions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Sesi Survei (TTL 24 Jam)
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    respondent_id UUID NOT NULL REFERENCES respondents(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    allow_adult_content BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Maksimal 1 active IN_PROGRESS session per respondent
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_session_per_respondent 
ON survey_sessions (respondent_id) 
WHERE status = 'IN_PROGRESS';

CREATE INDEX IF NOT EXISTS idx_sessions_respondent ON survey_sessions (respondent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status_expires ON survey_sessions (status, expires_at);

-- 5. Tabel Alokasi & Reservasi Lukisan ke Sesi (20 Lukisan per Sesi)
CREATE TABLE IF NOT EXISTS survey_session_paintings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES survey_sessions(id) ON DELETE CASCADE,
    painting_id UUID NOT NULL REFERENCES paintings(id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL CHECK (display_order >= 1 AND display_order <= 20),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ssp_session_painting ON survey_session_paintings (session_id, painting_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ssp_session_order ON survey_session_paintings (session_id, display_order);
CREATE INDEX IF NOT EXISTS idx_ssp_painting_id ON survey_session_paintings (painting_id);

-- 6. Tabel Jawaban Survei (Tersimpan pada setiap klik "Next")
CREATE TABLE IF NOT EXISTS survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_painting_id UUID NOT NULL REFERENCES survey_session_paintings(id) ON DELETE CASCADE,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_answer_per_session_painting ON survey_answers (session_painting_id);

-- 7. Tabel Pilihan Impresi pada Jawaban
CREATE TABLE IF NOT EXISTS survey_answer_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES survey_answers(id) ON DELETE CASCADE,
    impression_id VARCHAR(100) NOT NULL REFERENCES impressions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_answer_impression ON survey_answer_impressions (answer_id, impression_id);
CREATE INDEX IF NOT EXISTS idx_sai_impression_id ON survey_answer_impressions (impression_id);

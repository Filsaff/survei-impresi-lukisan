-- ==============================================================================
-- Migration 001: Initial Survey Backend Schema
-- Source of Truth: docs/survey-backend-prd.md
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: respondents
CREATE TABLE IF NOT EXISTS respondents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 1 AND age <= 120),
    education VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE respondents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Safely preserve legacy survey_answers if it has older schema structure
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'survey_answers' AND column_name = 'impression_ids'
    ) THEN
        ALTER TABLE survey_answers RENAME TO legacy_survey_answers;
    END IF;
END $$;

-- Deduplicate any existing test respondents by LOWER(email) before adding unique index
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM respondents GROUP BY LOWER(email) HAVING COUNT(*) > 1
    ) THEN
        -- Backup pre-dedup respondents
        CREATE TABLE IF NOT EXISTS backup_respondents_pre_dedup AS SELECT * FROM respondents;

        -- Update references in legacy_survey_answers if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legacy_survey_answers') THEN
            WITH primary_resp AS (
                SELECT DISTINCT ON (LOWER(email)) id AS keep_id, LOWER(email) AS email
                FROM respondents
                ORDER BY LOWER(email), created_at ASC
            ),
            to_replace AS (
                SELECT r.id, pr.keep_id
                FROM respondents r
                JOIN primary_resp pr ON LOWER(r.email) = pr.email
                WHERE r.id <> pr.keep_id
            )
            UPDATE legacy_survey_answers lsa
            SET respondent_id = tr.keep_id
            FROM to_replace tr
            WHERE lsa.respondent_id = tr.id;
        END IF;

        -- Delete duplicate respondent rows
        DELETE FROM respondents r
        WHERE r.id NOT IN (
            SELECT DISTINCT ON (LOWER(email)) id
            FROM respondents
            ORDER BY LOWER(email), created_at ASC
        );
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_respondents_email_lower ON respondents (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_respondents_created_at ON respondents (created_at);

-- 2. Table: paintings
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

-- 3. Table: impressions
CREATE TABLE IF NOT EXISTS impressions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: survey_sessions
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    respondent_id UUID NOT NULL REFERENCES respondents(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Constraint: Exactly ONE active IN_PROGRESS session per respondent
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_session_per_respondent 
ON survey_sessions (respondent_id) 
WHERE status = 'IN_PROGRESS';

CREATE INDEX IF NOT EXISTS idx_sessions_respondent ON survey_sessions (respondent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status_expires ON survey_sessions (status, expires_at);

-- 5. Table: survey_session_paintings (Allocation / Reservation)
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


-- 6. Table: survey_answers
CREATE TABLE IF NOT EXISTS survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_painting_id UUID NOT NULL REFERENCES survey_session_paintings(id) ON DELETE CASCADE,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_answer_per_session_painting ON survey_answers (session_painting_id);

-- 7. Table: survey_answer_impressions
CREATE TABLE IF NOT EXISTS survey_answer_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES survey_answers(id) ON DELETE CASCADE,
    impression_id VARCHAR(100) NOT NULL REFERENCES impressions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_answer_impression ON survey_answer_impressions (answer_id, impression_id);
CREATE INDEX IF NOT EXISTS idx_sai_impression_id ON survey_answer_impressions (impression_id);

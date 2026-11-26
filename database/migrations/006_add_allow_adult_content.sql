-- ==============================================================================
-- Migration 006: Add allow_adult_content flag to respondents and survey_sessions
-- ==============================================================================

-- 1. Add allow_adult_content to respondents (default: FALSE)
ALTER TABLE respondents 
ADD COLUMN IF NOT EXISTS allow_adult_content BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add allow_adult_content to survey_sessions (default: FALSE)
ALTER TABLE survey_sessions 
ADD COLUMN IF NOT EXISTS allow_adult_content BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Create index for fast lookups if needed
CREATE INDEX IF NOT EXISTS idx_respondents_allow_adult_content ON respondents (allow_adult_content);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_allow_adult_content ON survey_sessions (allow_adult_content);

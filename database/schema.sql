-- ==============================================================================
-- Schema Database Survei Impresi Lukisan Budaya
-- Engine: PostgreSQL 14+ (Cocok untuk AWS RDS PostgreSQL)
-- ==============================================================================

-- Aktifkan ekstensi uuid-ossp atau pgcrypto (biasanya pgcrypto sudah default aktif di RDS)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Responden
CREATE TABLE IF NOT EXISTS respondents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    age INTEGER,
    education VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Jawaban Survei Impresi
CREATE TABLE IF NOT EXISTS survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    respondent_id UUID NOT NULL REFERENCES respondents(id) ON DELETE CASCADE,
    painting_id VARCHAR(100) NOT NULL,
    impression_ids TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing untuk mempercepat query analisis skripsi / statistik
CREATE INDEX IF NOT EXISTS idx_respondents_email ON respondents(email);
CREATE INDEX IF NOT EXISTS idx_respondents_created_at ON respondents(created_at);
CREATE INDEX IF NOT EXISTS idx_answers_respondent_id ON survey_answers(respondent_id);
CREATE INDEX IF NOT EXISTS idx_answers_painting_id ON survey_answers(painting_id);

-- Contoh Query Verifikasi:
-- SELECT r.name, r.email, a.painting_id, a.impression_ids
-- FROM respondents r
-- JOIN survey_answers a ON r.id = a.respondent_id;

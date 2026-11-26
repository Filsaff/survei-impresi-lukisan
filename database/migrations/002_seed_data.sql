-- ==============================================================================
-- Migration 002: Seed Initial Impressions and Paintings
-- ==============================================================================

-- 1. Seed Impressions (38 Master Impressions)
INSERT INTO impressions (id, name) VALUES
    ('impression-1', 'Tenang'),
    ('impression-2', 'Membara'),
    ('impression-3', 'Bingung'),
    ('impression-4', 'Melankolis'),
    ('impression-5', 'Malu'),
    ('impression-6', 'Kejam'),
    ('impression-7', 'Marah'),
    ('impression-8', 'Suci'),
    ('impression-9', 'Cemburu'),
    ('impression-10', 'Sedih'),
    ('impression-11', 'Ikhlas'),
    ('impression-12', 'Misterius'),
    ('impression-13', 'Sopan'),
    ('impression-14', 'Angkuh'),
    ('impression-15', 'Cinta'),
    ('impression-16', 'Indah'),
    ('impression-17', 'Segan'),
    ('impression-18', 'Menjijikkan'),
    ('impression-19', 'Romantis'),
    ('impression-20', 'Nekad'),
    ('impression-21', 'Sabar'),
    ('impression-22', 'Sensual'),
    ('impression-23', 'Menakutkan'),
    ('impression-24', 'Resah'),
    ('impression-25', 'Letih'),
    ('impression-26', 'Sepi'),
    ('impression-27', 'Gembira'),
    ('impression-28', 'Penuh Harapan'),
    ('impression-29', 'Heroik'),
    ('impression-30', 'Spiritual'),
    ('impression-31', 'Berwibawa'),
    ('impression-32', 'Anggun'),
    ('impression-33', 'Elegan'),
    ('impression-34', 'Megah'),
    ('impression-35', 'Berani'),
    ('impression-36', 'Mencolok'),
    ('impression-37', 'Bagai Mimpi'),
    ('impression-38', 'Mempesona')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Seed Paintings (Seed 80 cultural paintings)
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM paintings) = 0 THEN
        INSERT INTO paintings (title, detail, image_key, is_adult_content)
        SELECT 
            'Lukisan Budaya Indonesia ' || i AS title,
            'Koleksi seni rupa budaya Nusantara.' AS detail,
            i || '.webp' AS image_key,
            FALSE AS is_adult_content
        FROM generate_series(1, 80) AS i;
    END IF;
END $$;


-- ==============================================================================
-- Migration 005: Update Impressions to 38 Standard Impressions
-- Source: references/daftar_impresi_lukisan_database.md
-- ==============================================================================

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

-- Delete any impression beyond impression-38 if exists
DELETE FROM impressions 
WHERE (regexp_replace(id, '[^0-9]', '', 'g'))::int > 38;

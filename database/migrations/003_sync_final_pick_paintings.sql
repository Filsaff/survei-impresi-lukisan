-- ==============================================================================
-- Migration 003: Sync Paintings with Final Pick Dataset (80 Paintings in .webp)
-- ==============================================================================

-- 1. Update existing paintings: change .jpg extension to .webp
UPDATE paintings 
SET image_key = REPLACE(image_key, '.jpg', '.webp')
WHERE image_key LIKE '%.jpg';

-- 2. Insert paintings 51 to 80 if they do not yet exist
INSERT INTO paintings (title, detail, image_key, is_adult_content)
SELECT 
    'Lukisan Budaya Indonesia ' || i AS title,
    'Koleksi seni rupa budaya Nusantara.' AS detail,
    i || '.webp' AS image_key,
    FALSE AS is_adult_content
FROM generate_series(51, 80) AS i
WHERE NOT EXISTS (
    SELECT 1 FROM paintings WHERE image_key = i || '.webp'
);

-- 3. Ensure all adult content flags remain FALSE
UPDATE paintings SET is_adult_content = FALSE WHERE is_adult_content = TRUE;


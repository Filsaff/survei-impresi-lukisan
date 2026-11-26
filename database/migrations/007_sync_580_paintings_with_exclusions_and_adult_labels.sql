-- ==============================================================================
-- Migration 007: Sync 580 Paintings with Exclusions and Adult Content Labels
-- Total range: 1..580
-- Excluded: 13 paintings (245, 270, 286, 330, 353, 357, 362, 365, 368, 414, 451, 533, 547)
-- Adult content: 39 paintings (144, 145, 147, 184, 211, 212, 222, 226, 229, 248, 250, 264, 265, 285, 321, 324, 331, 339, 355, 359, 433, 449, 463, 464, 488, 489, 494, 497, 503, 504, 505, 521, 544, 545, 550, 560, 561, 572, 576)
-- Expected valid total: 567 paintings (39 adult, 528 non-adult)
-- ==============================================================================

-- 1. Remove any paintings that match the 13 excluded numbers
DELETE FROM paintings
WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int IN (
    245, 270, 286, 330, 353, 357, 362, 365, 368, 414, 451, 533, 547
);

-- 2. Insert any missing paintings in range 1..580 (skipping the 13 excluded numbers)
INSERT INTO paintings (title, detail, image_key, is_adult_content)
SELECT 
    'Lukisan Budaya Indonesia ' || i AS title,
    'Koleksi seni rupa budaya Nusantara.' AS detail,
    i || '.webp' AS image_key,
    CASE 
        WHEN i IN (
            144, 145, 147, 184, 211, 212, 222, 226, 229, 248, 250, 264, 265, 285, 
            321, 324, 331, 339, 355, 359, 433, 449, 463, 464, 488, 489, 494, 497, 
            503, 504, 505, 521, 544, 545, 550, 560, 561, 572, 576
        ) THEN TRUE 
        ELSE FALSE 
    END AS is_adult_content
FROM generate_series(1, 580) AS i
WHERE i NOT IN (
    245, 270, 286, 330, 353, 357, 362, 365, 368, 414, 451, 533, 547
)
AND NOT EXISTS (
    SELECT 1 FROM paintings WHERE image_key = (i || '.webp')
);

-- 3. Synchronize adult content flags for ALL paintings in the database
-- Flag TRUE for the 39 adult paintings
UPDATE paintings
SET is_adult_content = TRUE
WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int IN (
    144, 145, 147, 184, 211, 212, 222, 226, 229, 248, 250, 264, 265, 285, 
    321, 324, 331, 339, 355, 359, 433, 449, 463, 464, 488, 489, 494, 497, 
    503, 504, 505, 521, 544, 545, 550, 560, 561, 572, 576
);

-- Flag FALSE for all other paintings
UPDATE paintings
SET is_adult_content = FALSE
WHERE (regexp_replace(image_key, '[^0-9]', '', 'g'))::int NOT IN (
    144, 145, 147, 184, 211, 212, 222, 226, 229, 248, 250, 264, 265, 285, 
    321, 324, 331, 339, 355, 359, 433, 449, 463, 464, 488, 489, 494, 497, 
    503, 504, 505, 521, 544, 545, 550, 560, 561, 572, 576
);

-- 4. Standardize titles and details for consistency
UPDATE paintings 
SET title = 'Lukisan Budaya Indonesia ' || (regexp_replace(image_key, '[^0-9]', '', 'g'))
WHERE image_key ~ '^[0-9]';

UPDATE paintings 
SET detail = 'Koleksi seni rupa budaya Nusantara.'
WHERE detail != 'Koleksi seni rupa budaya Nusantara.';

-- ==============================================================================
-- Migration 004: Standardize Paintings Titles and Reset Adult Content Flags
-- ==============================================================================

-- 1. Reset all adult content flags to FALSE for all cultural paintings
UPDATE paintings 
SET is_adult_content = FALSE;

-- 2. Standardize titles to 'Lukisan Budaya Indonesia [Nomor]' matching image_key
UPDATE paintings 
SET title = 'Lukisan Budaya Indonesia ' || (regexp_replace(image_key, '[^0-9]', '', 'g'))
WHERE image_key ~ '^[0-9]';

-- 3. Standardize details to neutral cultural disclaimer across all paintings
UPDATE paintings 
SET detail = 'Koleksi seni rupa budaya Nusantara.'
WHERE detail != 'Koleksi seni rupa budaya Nusantara.';

-- ==============================================================================
-- FOREVERE JEWELLERY - FIX JEWELLERY SPELLING MIGRATION
-- Migration: 20261013000000_fix_jewellery_spelling.sql
-- ==============================================================================

-- Correct the spelling of 'Jewellary' to 'Jewellery' in database records
UPDATE public.homepage_content
SET about_us_text = REPLACE(about_us_text, 'Jewellary', 'Jewellery')
WHERE about_us_text LIKE '%Jewellary%';

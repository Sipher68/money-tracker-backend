-- Migration: Add category column to transactions table
-- This adds a simple category string column to match the frontend expectations

-- Add the category column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT;

-- You can keep the category_id for future use or remove it
-- ALTER TABLE transactions DROP COLUMN category_id; -- Uncomment this if you want to remove it

-- Update any existing transactions to have a default category
UPDATE transactions SET category = 'Other' WHERE category IS NULL OR category = '';

-- Make category required going forward
ALTER TABLE transactions ALTER COLUMN category SET NOT NULL;

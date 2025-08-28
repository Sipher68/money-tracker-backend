-- Update savings_goals table to add missing fields
-- Execute this in your Supabase SQL Editor

-- Add category and priority columns to savings_goals table
ALTER TABLE savings_goals 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other',
  ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_savings_goals_category ON savings_goals(category);
CREATE INDEX IF NOT EXISTS idx_savings_goals_priority ON savings_goals(priority);
CREATE INDEX IF NOT EXISTS idx_savings_goals_is_completed ON savings_goals(is_completed);

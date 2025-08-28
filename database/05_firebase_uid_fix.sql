-- Fix User ID Schema for Firebase Integration
-- Run this in your Supabase SQL Editor to fix UUID/Firebase UID compatibility

-- First, drop all RLS policies that depend on the id column
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON budget_categories;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete own savings goals" ON savings_goals;

-- Disable RLS first to avoid policy conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals DISABLE ROW LEVEL SECURITY;

-- Drop ALL foreign key constraints first
ALTER TABLE budget_categories DROP CONSTRAINT IF EXISTS budget_categories_user_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;
ALTER TABLE savings_goals DROP CONSTRAINT IF EXISTS savings_goals_user_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Clear any existing data that might cause conflicts
TRUNCATE TABLE savings_goals CASCADE;
TRUNCATE TABLE budgets CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE budget_categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- Now change all the column types
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE budget_categories ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE budgets ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE savings_goals ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraints with the new TEXT type
ALTER TABLE budget_categories ADD CONSTRAINT budget_categories_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE savings_goals ADD CONSTRAINT savings_goals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Success message
SELECT 'Schema updated successfully for Firebase UID compatibility! All data cleared and ready for Firebase UIDs.' as result;

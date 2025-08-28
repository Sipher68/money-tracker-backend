import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Debug logging
console.log('🔧 Supabase Configuration:');
console.log('- URL:', supabaseUrl);
console.log(
  '- Service Role Key:',
  supabaseServiceRoleKey
    ? `${supabaseServiceRoleKey.substring(0, 10)}...`
    : 'Not set'
);

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  SAVINGS_GOALS: 'savings_goals',
} as const;

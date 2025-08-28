#!/usr/bin/env node
/**
 * Database Connection Test
 *
 * This script tests the Supabase database connection
 * Run with: node scripts/test-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔧 Testing Supabase Database Connection...\n');

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment Variables:');
  console.log('- SUPABASE_URL:', supabaseUrl);
  console.log(
    '- SUPABASE_SERVICE_ROLE_KEY:',
    supabaseServiceRoleKey
      ? `${supabaseServiceRoleKey.substring(0, 20)}...`
      : 'Not set'
  );
  console.log();

  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    console.error('❌ SUPABASE_URL is not set or is placeholder');
    console.log('Please check your .env file');
    return;
  }

  if (!supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-key') {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set or is placeholder');
    console.log('Please check your .env file');
    return;
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('✅ Supabase client created');

  // Test 1: Basic connection
  try {
    console.log('🧪 Test 1: Basic connection test...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      console.error('Error details:', error);
      return;
    }

    console.log('✅ Basic connection successful');
    console.log('📊 Users table count:', data);
    console.log();
  } catch (error) {
    console.error('❌ Connection test failed with exception:', error.message);
    console.error('Full error:', error);
    return;
  }

  // Test 2: List tables
  try {
    console.log('🧪 Test 2: Checking if tables exist...');
    const { data: tables, error } = await supabase.rpc('get_table_names'); // This might not work, but we'll try

    if (error && !error.message.includes('function get_table_names')) {
      console.error('❌ Table check failed:', error.message);
    }
  } catch (error) {
    console.log('⚠️ Table listing not available (this is normal)');
  }

  // Test 3: Try to select from each table
  const tablesToTest = [
    'users',
    'transactions',
    'budget_categories',
    'budgets',
    'savings_goals',
  ];

  console.log('🧪 Test 3: Testing individual tables...');
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Table '${table}' error:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (error) {
      console.error(`❌ Table '${table}' exception:`, error.message);
    }
  }

  // Test 4: Test RLS policies
  try {
    console.log('\n🧪 Test 4: Testing Row Level Security...');
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
      if (error.message.includes('RLS')) {
        console.log('✅ RLS is working (blocking unauthorized access)');
      } else {
        console.error('❌ Unexpected error:', error.message);
      }
    } else {
      console.log('✅ Query successful (or RLS allows service role access)');
      console.log('📊 Sample data count:', data?.length || 0);
    }
  } catch (error) {
    console.error('❌ RLS test failed:', error.message);
  }

  console.log('\n🎉 Database connection test completed!');
}

if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('\n✅ All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };

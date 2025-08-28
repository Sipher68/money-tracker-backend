#!/usr/bin/env node
/**
 * Create User in Supabase Database
 *
 * This script creates the test user record in Supabase
 * Run with: node scripts/create-supabase-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createSupabaseUser() {
  console.log('👤 Creating User Record in Supabase...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const testUser = {
    id: 'V9CA1ElEk6fmqTInjqImxeTylbz1', // The UID from Firebase
    email: 'test@moneytracker.com',
    full_name: 'Test User',
  };

  try {
    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError.message);
      return;
    }

    if (existingUser) {
      console.log('✅ User already exists:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.full_name}`);
      console.log(`   Created: ${existingUser.created_at}`);
      return;
    }

    // Create user record
    console.log('👤 Creating new user record...');
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error.message);
      console.error('Error details:', error);
      return;
    }

    console.log('✅ User created successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Name: ${data.full_name}`);
    console.log(`   Created: ${data.created_at}`);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

if (require.main === module) {
  createSupabaseUser()
    .then(() => {
      console.log('\n✅ User setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ User setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createSupabaseUser };

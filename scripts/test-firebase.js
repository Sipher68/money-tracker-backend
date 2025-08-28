#!/usr/bin/env node
/**
 * Firebase Authentication Test Script
 *
 * This script helps test Firebase authentication setup
 * Run with: node scripts/test-firebase.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

async function testFirebaseSetup() {
  console.log('🔥 Testing Firebase Authentication Setup...\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('\nPlease update your .env file with the missing variables.');
    process.exit(1);
  }
  console.log('✅ All environment variables found');

  // Initialize Firebase Admin
  console.log('\n2. Initializing Firebase Admin...');
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }

  // Test Firebase connection
  console.log('\n3. Testing Firebase connection...');
  try {
    // Try to list users (limited to 1 to test connection)
    const listUsers = await admin.auth().listUsers(1);
    console.log('✅ Successfully connected to Firebase Auth');
    console.log(
      `   Found ${listUsers.users.length} user(s) in your Firebase project`
    );
  } catch (error) {
    console.error('❌ Failed to connect to Firebase:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 Firebase setup is working correctly!');
  console.log('\nNext steps:');
  console.log(
    '1. Create test users in Firebase Console or using the create-test-user script'
  );
  console.log('2. Get user tokens for API testing');
  console.log('3. Test your protected API endpoints');

  process.exit(0);
}

// Handle unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

testFirebaseSetup();

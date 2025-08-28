#!/usr/bin/env node
/**
 * Create Test User Script
 *
 * This script creates test users in Firebase for API testing
 * Run with: node scripts/create-test-user.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

async function createTestUser() {
  console.log('👤 Creating Test User in Firebase...\n');

  // Initialize Firebase Admin if not already done
  if (!admin.apps.length) {
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error.message);
      process.exit(1);
    }
  }

  // Create test user
  const testUser = {
    email: 'test@moneytracker.com',
    password: 'TestPassword123!',
    displayName: 'Test User',
    emailVerified: true,
  };

  try {
    // Check if user already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(testUser.email);
      console.log(`⚠️  User ${testUser.email} already exists`);
      console.log(`   UID: ${existingUser.uid}`);
      console.log('\nYou can use this user for testing.');
      return;
    } catch (error) {
      // User doesn't exist, continue with creation
    }

    // Create the user
    const userRecord = await admin.auth().createUser(testUser);

    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Password: ${testUser.password}`);

    // Create custom claims (optional)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'user',
      testUser: true,
    });

    console.log('✅ Custom claims set');

    console.log('\n📝 To get an authentication token for API testing:');
    console.log('1. Use the Firebase Auth REST API:');
    console.log(
      `   curl -X POST 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_WEB_API_KEY' \\`
    );
    console.log(`        -H 'Content-Type: application/json' \\`);
    console.log(`        -d '{`);
    console.log(`          "email": "${testUser.email}",`);
    console.log(`          "password": "${testUser.password}",`);
    console.log(`          "returnSecureToken": true`);
    console.log(`        }'`);
    console.log('\n2. Or use the token from your frontend application');
    console.log(
      '\n3. Get your Web API Key from Firebase Console → Project Settings → General'
    );
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);

    if (error.code === 'auth/email-already-exists') {
      console.log('The email address is already in use by another account.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('The email address is not valid.');
    } else if (error.code === 'auth/weak-password') {
      console.log('The password is too weak.');
    }

    process.exit(1);
  }

  process.exit(0);
}

// Alternative function to create multiple test users
async function createMultipleTestUsers() {
  const users = [
    {
      email: 'alice@moneytracker.com',
      password: 'AlicePass123!',
      displayName: 'Alice Johnson',
    },
    {
      email: 'bob@moneytracker.com',
      password: 'BobPass123!',
      displayName: 'Bob Smith',
    },
    {
      email: 'charlie@moneytracker.com',
      password: 'CharliePass123!',
      displayName: 'Charlie Brown',
    },
  ];

  console.log(`👥 Creating ${users.length} test users...\n`);

  for (const user of users) {
    try {
      // Check if user exists
      try {
        await admin.auth().getUserByEmail(user.email);
        console.log(`⚠️  ${user.email} already exists, skipping...`);
        continue;
      } catch (error) {
        // User doesn't exist, create it
      }

      const userRecord = await admin.auth().createUser({
        ...user,
        emailVerified: true,
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 'user',
        testUser: true,
      });

      console.log(`✅ Created: ${user.email} (${userRecord.uid})`);
    } catch (error) {
      console.error(`❌ Failed to create ${user.email}:`, error.message);
    }
  }

  console.log('\n🎉 Batch user creation completed!');
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--multiple') || args.includes('-m')) {
  createMultipleTestUsers();
} else {
  createTestUser();
}

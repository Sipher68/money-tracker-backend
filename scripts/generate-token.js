#!/usr/bin/env node
/**
 * Generate Custom Token Script
 *
 * This script creates a custom token using Firebase Admin SDK
 * Run with: node scripts/generate-token.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

async function generateCustomToken() {
  try {
    console.log('🔐 Generating Firebase Custom Token...\n');

    // Initialize Firebase Admin if not already done
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin initialized');
    }

    // Use the existing test user UID
    const uid = 'V9CA1ElEk6fmqTInjqImxeTylbz1'; // The UID from your test user

    // Generate custom token
    const customToken = await admin.auth().createCustomToken(uid, {
      email: 'test@moneytracker.com',
      role: 'user',
    });

    console.log('✅ Custom token generated successfully!\n');
    console.log('🔑 Custom Token:');
    console.log(customToken);
    console.log('\n📝 Usage:');
    console.log('Copy this token and use it in your API requests:');
    console.log(
      `curl -H "Authorization: Bearer ${customToken}" http://localhost:5000/api/transactions`
    );
    console.log(
      '\n⚠️  Note: This is a custom token. Your frontend should exchange it for an ID token.'
    );
    console.log(
      'For testing purposes, you can use this directly with your backend API.\n'
    );
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure your Firebase credentials are correct in .env');
    console.error('2. Verify the user UID exists in Firebase Auth');
    console.error('3. Check that Firebase Admin SDK is properly initialized');
    process.exit(1);
  }
}

if (require.main === module) {
  generateCustomToken();
}

module.exports = { generateCustomToken };

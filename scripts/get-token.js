#!/usr/bin/env node
/**
 * Get Authentication Token Script
 *
 * This script helps you get Firebase auth tokens for API testing
 * Run with: node scripts/get-token.js
 */

const https = require('https');
require('dotenv').config();

async function getAuthToken(email, password, apiKey) {
  const data = JSON.stringify({
    email: email,
    password: password,
    returnSecureToken: true,
  });

  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    port: 443,
    path: `/v1/accounts:signInWithPassword?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🎫 Getting Firebase Authentication Token...\n');

  // Default test user credentials
  const email = process.argv[2] || 'test@moneytracker.com';
  const password = process.argv[3] || 'TestPassword123!';

  // You need to get this from Firebase Console → Project Settings → General → Web API Key
  const apiKey = process.argv[4] || process.env.FIREBASE_WEB_API_KEY;

  if (!apiKey) {
    console.error('❌ Firebase Web API Key is required!');
    console.log('\nTo get your Web API Key:');
    console.log('1. Go to Firebase Console → Project Settings');
    console.log('2. Scroll to "Your apps" section');
    console.log('3. Add a web app or find existing one');
    console.log('4. Copy the apiKey from the config');
    console.log('\nThen either:');
    console.log('- Add FIREBASE_WEB_API_KEY=your_key to .env file');
    console.log(
      '- Or pass it as the third argument: node scripts/get-token.js email password apiKey'
    );
    process.exit(1);
  }

  console.log(`Email: ${email}`);
  console.log(`Using API Key: ${apiKey.substring(0, 10)}...`);

  try {
    const response = await getAuthToken(email, password, apiKey);

    console.log('\n✅ Authentication successful!');
    console.log('\n🎫 Your tokens:');
    console.log('─'.repeat(80));
    console.log(`ID Token (use this for API requests):`);
    console.log(`${response.idToken}`);
    console.log('\n─'.repeat(80));
    console.log(`Refresh Token:`);
    console.log(`${response.refreshToken}`);
    console.log('\n─'.repeat(80));

    console.log('\n📋 Token Details:');
    console.log(`User ID: ${response.localId}`);
    console.log(`Email: ${response.email}`);
    console.log(`Email Verified: ${response.emailVerified}`);
    console.log(
      `Expires in: ${response.expiresIn} seconds (${Math.floor(
        response.expiresIn / 3600
      )} hours)`
    );

    console.log('\n🧪 Test your API with curl:');
    console.log(
      `curl -H "Authorization: Bearer ${response.idToken}" http://localhost:5000/api/transactions`
    );

    console.log('\n💡 Save this token for testing (valid for 1 hour)');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.log('\nCommon issues:');
    console.log('- Wrong email or password');
    console.log("- User doesn't exist (run: node scripts/create-test-user.js)");
    console.log('- Invalid API key');
    console.log(
      '- Email/password authentication not enabled in Firebase Console'
    );
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node scripts/get-token.js [email] [password] [apiKey]');
  console.log('\nExamples:');
  console.log('  node scripts/get-token.js');
  console.log('  node scripts/get-token.js user@example.com password123');
  console.log(
    '  node scripts/get-token.js user@example.com password123 AIzaSyC...'
  );
  console.log('\nDefault email: test@moneytracker.com');
  console.log('Default password: TestPassword123!');
  process.exit(0);
}

main();

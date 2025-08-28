# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Money Tracker backend.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project details:
   - **Project name**: `money-tracker` (or your preferred name)
   - **Google Analytics**: Optional (can disable for now)
4. Click "Create project"
5. Wait for project creation to complete

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the sign-in methods you want:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Optional - Click and configure if desired
   - **Other providers**: GitHub, Facebook, etc. (optional)

## Step 3: Get Firebase Configuration

### Get Project Settings:

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Note your **Project ID** (you'll need this)

### Generate Service Account Key:

1. Still in Project Settings, go to "Service accounts" tab
2. Click "Generate new private key"
3. Click "Generate key" - this downloads a JSON file
4. **Keep this file secure!** It contains sensitive credentials

## Step 4: Configure Your Environment Variables

### Extract credentials from the downloaded JSON file:

The JSON file looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Update your `.env` file with the real values:

```env
# Replace these placeholder values in your .env file:
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-actual-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**

- Keep the quotes around the private key
- Keep the `\n` characters in the private key
- Don't share these credentials publicly

## Step 5: Set Up Authentication Rules (Optional)

### Firebase Security Rules:

If you plan to use Firebase Storage or Firestore later, you can set up rules:

1. Go to "Firestore Database" or "Storage"
2. Click "Rules" tab
3. Set up rules to allow authenticated users only

## Step 6: Test Your Configuration

### Start your backend server:

```bash
npm run dev
```

### Test endpoints:

1. **Health check**: `http://localhost:5000/health`
2. **Protected endpoint**: Try accessing `http://localhost:5000/api/transactions`
   - Without token: Should return 401 Unauthorized
   - With valid token: Should work (you'll need to create a test user first)

## Step 7: Create Test Users

### Option A: Through Firebase Console

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Click "Add user"

### Option B: Through your frontend (when you build it)

- Users can sign up through your app's registration form
- Firebase handles password hashing and user management

### Option C: Using Firebase Admin SDK (for testing)

You can create a test script to generate users programmatically.

## Step 8: Get User Tokens for API Testing

To test your protected API endpoints, you need user tokens:

### Method 1: Using Firebase Auth REST API

```bash
# Replace YOUR_API_KEY with your Firebase Web API key (from Project Settings > General)
curl -X POST 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY' \
-H 'Content-Type: application/json' \
-d '{
  "email": "test@example.com",
  "password": "testpassword",
  "returnSecureToken": true
}'
```

This returns an `idToken` you can use in your API requests.

### Method 2: Through your frontend app

When users log in through your frontend, Firebase provides tokens automatically.

## Step 9: Test Protected Endpoints

Use the token in your API requests:

```bash
# Replace YOUR_TOKEN with the actual token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/transactions
```

## Troubleshooting

### Common Issues:

1. **"Error initializing Firebase Admin"**

   - Check your private key formatting (keep \n characters)
   - Verify project ID is correct
   - Make sure service account has proper permissions

2. **"Invalid token" errors**

   - Token might be expired (they expire after 1 hour)
   - Verify you're sending the token in the Authorization header
   - Check that the token is from the same Firebase project

3. **"Permission denied" errors**

   - Make sure your service account has the right permissions
   - Verify Firebase Authentication is enabled in your project

4. **Environment variable issues**
   - Make sure .env file is in the project root
   - Restart your server after changing .env values
   - Check for typos in variable names

### Getting Your Web API Key:

1. Go to Project Settings → General tab
2. Scroll down to "Your apps" section
3. If you haven't added a web app, click "Add app" → Web
4. The API key will be shown in the config object

## Next Steps

After Firebase is working:

1. **Database Integration**: Your backend will create user records in Supabase when users sign up
2. **Frontend Integration**: Build a React/Vue/etc. frontend that uses Firebase Auth
3. **Token Management**: Implement token refresh logic
4. **User Profiles**: Allow users to update their profiles
5. **Password Reset**: Implement forgot password functionality

## Security Best Practices

- Never commit service account keys to version control
- Use environment variables for all sensitive data
- Set up proper CORS policies
- Implement rate limiting (already included in your backend)
- Use HTTPS in production
- Regularly rotate service account keys

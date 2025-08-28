import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import admin from 'firebase-admin';

// Initialize Firebase Admin with better error handling
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized || admin.apps.length > 0) {
    return true;
  }

  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Firebase not configured. Missing environment variables: ${missingVars.join(
        ', '
      )}`
    );
    return false;
  }

  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    return false;
  }
};

export const authenticateFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const isFirebaseConfigured = initializeFirebase();

    // Development mode - skip Firebase auth if not configured
    if (!isFirebaseConfigured) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Development mode: Using mock authentication');
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
        };
        return next();
      } else {
        return res.status(500).json({
          success: false,
          error: 'Firebase authentication not configured',
        });
      }
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required. Format: Bearer <token>',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required',
      });
    }

    // Verify the Firebase token
    let decodedToken;
    
    try {
      // First try to verify as ID token
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error: any) {
      // If it's a custom token error and we're in development, handle it differently
      if (error.code === 'auth/argument-error' && 
          error.message.includes('custom token') && 
          process.env.NODE_ENV === 'development') {
        
        console.log('🔧 Development mode: Handling custom token');
        
        // For development, we'll decode the custom token manually (not recommended for production)
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(token, { complete: true });
          
          if (decoded && decoded.payload) {
            decodedToken = {
              uid: decoded.payload.uid || 'dev-user',
              email: decoded.payload.claims?.email || 'dev@example.com',
              // Add other properties as needed
            };
            console.log('✅ Custom token decoded for development');
          } else {
            throw new Error('Invalid custom token structure');
          }
        } catch (decodeError) {
          throw error; // Re-throw the original error
        }
      } else {
        throw error; // Re-throw for other types of errors
      }
    }

    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };

    console.log(`✅ User authenticated: ${req.user.email} (${req.user.uid})`);
    next();
  } catch (error: any) {
    console.error('Firebase token verification failed:', error);

    // Provide specific error messages for common issues
    let errorMessage = 'Invalid or expired authentication token';

    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Authentication token has expired. Please log in again.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Invalid authentication token format.';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage =
        'Authentication token has been revoked. Please log in again.';
    }

    return res.status(401).json({
      success: false,
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

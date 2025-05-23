import { NextRequest } from 'next/server';
import { adminAuth } from '../firebase-admin'; // Assuming firebase-admin is initialized here
import { DEV_USER_ID } from '../store'; // Added import

interface FirebaseUser {
  uid: string;
  email?: string;
  // Add other properties you might need from the decoded token
}

/**
 * Verifies the Firebase ID token from the Authorization header of a NextRequest.
 * @param request The NextRequest object.
 * @returns The FirebaseUser object containing uid and other token claims, or null if authentication fails.
 */
export async function getFirebaseUser(
  request: NextRequest
): Promise<FirebaseUser | null> {
  // 1. Explicit environment variable override for static user ID
  if (process.env.STATIC_USER_ID) {
    console.log(
      `[getFirebaseUser] Using static user ID from environment variable: ${process.env.STATIC_USER_ID}`
    );
    return {
      uid: process.env.STATIC_USER_ID,
      email: 'static-override-user@example.com', // Optional: provide a static email
    };
  }

  // 2. Default developer user ID in development environment
  //    Ensure DEV_USER_ID is defined and not empty.
  if (process.env.NODE_ENV === 'development' && DEV_USER_ID) {
    console.log(
      `[getFirebaseUser] Using DEV_USER_ID for development: ${DEV_USER_ID}`
    );
    return {
      uid: DEV_USER_ID,
      email: 'dev-user@example.com', // Optional: provide a static email for dev user
    };
  }

  // 3. Firebase token authentication (production or no static/dev ID configured)
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(
      '[getFirebaseUser] No Bearer token found in Authorization header.'
    );
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('[getFirebaseUser] Bearer token is empty.');
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      // Add other desired claims from decodedToken
    };
  } catch (error: unknown) {
    let errorMessage = 'Unknown error verifying Firebase ID token.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(
      `[getFirebaseUser] Error verifying Firebase ID token: ${errorMessage}`,
      error
    );

    // It's common for Firebase errors to have a 'code' property
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'auth/id-token-expired') {
      console.warn('[getFirebaseUser] Firebase ID token has expired.');
    } else if (firebaseError.code === 'auth/argument-error') {
      console.warn(
        '[getFirebaseUser] Firebase ID token has invalid signature or structure.'
      );
    }
    return null;
  }
}

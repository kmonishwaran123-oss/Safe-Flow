import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signOut,
    type User,
    type Auth,
} from 'firebase/auth';

// ============================================================
// 🔥 FIREBASE CONFIGURATION
// ============================================================
// Replace these values with your actual Firebase project config.
// You can find these in Firebase Console > Project Settings > General > Your apps > Web app
// ============================================================
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoKeyReplaceMeWithYourActualKey",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smart-mobility-demo.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smart-mobility-demo",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smart-mobility-demo.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Initialize Firebase (prevent multiple initializations in dev mode)
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth: Auth = getAuth(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

// ============================================================
// 🔐 FIREBASE AUTH HELPER FUNCTIONS
// ============================================================

/**
 * Sign in with email and password
 */
export async function firebaseSignInWithEmail(email: string, password: string) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await result.user.getIdToken();
        return {
            success: true,
            user: result.user,
            idToken,
        };
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        return {
            success: false,
            error: getFirebaseErrorMessage(firebaseError.code || ''),
        };
    }
}

/**
 * Register new user with email and password
 */
export async function firebaseRegisterWithEmail(
    email: string,
    password: string,
    displayName: string
) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(result.user, { displayName });

        // Send email verification
        await sendEmailVerification(result.user);

        const idToken = await result.user.getIdToken();
        return {
            success: true,
            user: result.user,
            idToken,
            message: 'Account created! Please check your email for verification.',
        };
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        return {
            success: false,
            error: getFirebaseErrorMessage(firebaseError.code || ''),
        };
    }
}

/**
 * Sign in with Google
 */
export async function firebaseSignInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        return {
            success: true,
            user: result.user,
            idToken,
        };
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === 'auth/popup-closed-by-user') {
            return { success: false, error: 'Sign-in cancelled' };
        }
        return {
            success: false,
            error: getFirebaseErrorMessage(firebaseError.code || ''),
        };
    }
}

/**
 * Sign in with GitHub
 */
export async function firebaseSignInWithGithub() {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const idToken = await result.user.getIdToken();
        return {
            success: true,
            user: result.user,
            idToken,
        };
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === 'auth/popup-closed-by-user') {
            return { success: false, error: 'Sign-in cancelled' };
        }
        return {
            success: false,
            error: getFirebaseErrorMessage(firebaseError.code || ''),
        };
    }
}

/**
 * Send password reset email
 */
export async function firebaseSendPasswordReset(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Password reset email sent! Check your inbox.',
        };
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        return {
            success: false,
            error: getFirebaseErrorMessage(firebaseError.code || ''),
        };
    }
}

/**
 * Resend email verification
 */
export async function firebaseResendVerification() {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'No user signed in' };

    try {
        await sendEmailVerification(user);
        return {
            success: true,
            message: 'Verification email sent!',
        };
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        return {
            success: false,
            error: getFirebaseErrorMessage(firebaseError.code || ''),
        };
    }
}

/**
 * Sign out
 */
export async function firebaseSignOut() {
    try {
        await signOut(auth);
        return { success: true };
    } catch {
        return { success: false, error: 'Sign out failed' };
    }
}

/**
 * Get current user's ID token (for API calls)
 */
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    try {
        return await user.getIdToken(true);
    } catch {
        return null;
    }
}

/**
 * Listen to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

// ============================================================
// 🛡️ FIREBASE ERROR MESSAGE MAPPING
// ============================================================
function getFirebaseErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters long.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/popup-blocked': 'Pop-up blocked by browser. Please allow pop-ups.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
        'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled. Contact administrator.',
        'auth/user-disabled': 'This account has been disabled. Contact support.',
        'auth/requires-recent-login': 'Please sign in again to complete this action.',
        'auth/invalid-api-key': 'Firebase configuration error. Contact administrator.',
    };

    return errorMessages[code] || `Authentication error: ${code}`;
}

// Export instances and types
export { auth, app, googleProvider, githubProvider };
export type { User };

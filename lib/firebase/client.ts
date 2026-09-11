import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (typeof window !== "undefined") {
  try {
    if (isFirebaseConfigured()) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
    }
  } catch (err) {
    console.warn("Firebase client initialization deferred:", err);
  }
}

export function getClientAuth(): Auth {
  if (!auth) {
    if (typeof window !== "undefined" && isFirebaseConfigured()) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      return auth;
    }
    throw new Error(
      "Firebase Client is not configured. Please add NEXT_PUBLIC_FIREBASE_* environment variables to your settings."
    );
  }
  return auth;
}

/**
 * Sign up a new user with email and password via Firebase Authentication
 */
export async function signUpWithFirebase(
  emailOrName: string,
  passwordOrEmail: string,
  maybePassword?: string
) {
  const clientAuth = getClientAuth();
  let name = "";
  let email = "";
  let password = "";

  if (maybePassword !== undefined) {
    // Called as (email, password, name) or (name, email, password)
    if (emailOrName.includes("@")) {
      email = emailOrName;
      password = passwordOrEmail;
      name = maybePassword;
    } else {
      name = emailOrName;
      email = passwordOrEmail;
      password = maybePassword;
    }
  } else {
    email = emailOrName;
    password = passwordOrEmail;
  }

  const userCredential = await createUserWithEmailAndPassword(clientAuth, email.trim(), password);
  
  if (name.trim()) {
    await updateProfile(userCredential.user, { displayName: name.trim() }).catch(() => null);
  }

  // Send email verification link
  await sendEmailVerification(userCredential.user).catch((err) => {
    console.warn("Email verification send warning:", err);
  });

  return userCredential.user;
}

/**
 * Sign in existing user with email and password via Firebase Authentication
 */
export async function signInWithFirebase(email: string, password: string) {
  const clientAuth = getClientAuth();
  const userCredential = await signInWithEmailAndPassword(clientAuth, email.trim(), password);
  return userCredential.user;
}

/**
 * Sign in with Google OAuth popup via Firebase Authentication
 */
export async function signInWithGoogleFirebase() {
  const clientAuth = getClientAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const userCredential = await signInWithPopup(clientAuth, provider);
  return userCredential.user;
}

export const signInWithGooglePopup = signInWithGoogleFirebase;

/**
 * Send password reset email via Firebase
 */
export async function sendFirebasePasswordReset(email: string) {
  const clientAuth = getClientAuth();
  return sendPasswordResetEmail(clientAuth, email.trim());
}

/**
 * Resend email verification link to current authenticated user
 */
export async function resendFirebaseVerification(user?: FirebaseUser) {
  const clientAuth = getClientAuth();
  const targetUser = user || clientAuth.currentUser;
  if (!targetUser) {
    throw new Error("No active authenticated user to send verification email to.");
  }
  return sendEmailVerification(targetUser);
}

export const sendVerificationEmail = resendFirebaseVerification;

/**
 * Reloads the current user state from Firebase backend
 */
export async function reloadCurrentUser(): Promise<FirebaseUser | null> {
  const clientAuth = getClientAuth();
  if (clientAuth.currentUser) {
    await clientAuth.currentUser.reload();
    return clientAuth.currentUser;
  }
  return null;
}

/**
 * Returns current cached Firebase user if available
 */
export function getFirebaseUser(): FirebaseUser | null {
  if (!auth) return null;
  return auth.currentUser;
}

/**
 * Sign out of Firebase client
 */
export async function signOutFirebase() {
  if (auth) {
    await signOut(auth).catch(() => null);
  }
}

export const signOutFromFirebase = signOutFirebase;

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const getFirebaseConfig = () => {
  // 1. Try environment variables (Local / Manual deployment)
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  // If we have API Key from env, use it
  if (envConfig.apiKey) {
    return envConfig;
  }

  // 2. Try App Hosting configuration (Injected as JSON string)
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const appHostingConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      return appHostingConfig;
    } catch (e) {
      console.error("Error parsing FIREBASE_WEBAPP_CONFIG", e);
    }
  }

  return envConfig;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Analytics (Safe for SSR)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, storage, auth, analytics };

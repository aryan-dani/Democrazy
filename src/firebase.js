/**
 * Firebase is loaded on-demand (dynamic import) so the main bundle stays smaller
 * until Google sync / Firestore paths actually run.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** @returns {boolean} */
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/** @type {Promise<import('firebase/app').FirebaseApp | null> | null} */
let appPromise = null;

/**
 * Lazily initializes (once) and returns the Firebase app, or null if env is incomplete.
 * @returns {Promise<import('firebase/app').FirebaseApp | null>}
 */
export function loadFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return Promise.resolve(null);
  }
  if (!appPromise) {
    appPromise = import("firebase/app").then(({ initializeApp, getApps }) => {
      const existing = getApps()[0];
      if (existing) return existing;
      return initializeApp(firebaseConfig);
    });
  }
  return appPromise;
}

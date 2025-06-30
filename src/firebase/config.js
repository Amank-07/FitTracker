import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Debug: Check if environment variables are loaded
console.log('Firebase Config Debug:');
console.log('API Key exists:', !!process.env.REACT_APP_FIREBASE_API_KEY);
console.log('Auth Domain exists:', !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
console.log('Project ID exists:', !!process.env.REACT_APP_FIREBASE_PROJECT_ID);

// Firebase configuration object with environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate required configuration
const requiredConfig = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing required Firebase configuration: ${missingConfig.join(', ')}\n` +
    'Please check your environment variables.'
  );
}

console.log('Final Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check in production
if (process.env.NODE_ENV === 'production') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for Firestore (with size limit)
try {
  const settings = {
    cacheSizeBytes: 50 * 1024 * 1024, // 50 MB cache size
    experimentalForceLongPolling: true // Better compatibility for some browsers
  };
  db.settings(settings);
  db.enablePersistence()
    .catch((err) => {
      console.warn('Firestore persistence failed to enable:', err.code);
    });
} catch (err) {
  console.warn('Firestore settings failed to apply:', err);
}

export default app; 
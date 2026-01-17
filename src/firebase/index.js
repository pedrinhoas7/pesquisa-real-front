import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const remoteConfig = getRemoteConfig(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

remoteConfig.settings = {
    fetchTimeoutMillis: 10000,
    minimumFetchIntervalMillis: 0,
};

export { db, analytics, remoteConfig, auth, provider, fetchAndActivate, getValue, collection, addDoc };
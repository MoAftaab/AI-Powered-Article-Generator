import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log complete config for debugging (excluding sensitive values)
console.log('Firebase Config Details:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain ? 'Set' : 'Missing',
  projectId: firebaseConfig.projectId ? 'Set' : 'Missing',
  storageBucket: firebaseConfig.storageBucket ? 'Set' : 'Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
  appId: firebaseConfig.appId ? 'Set' : 'Missing'
});

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Missing required Firebase configuration. Please check your environment variables.');
}

// Initialize Firebase
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Firebase services with enhanced error handling
let auth: Auth;
let db: Firestore;
let isInitialized = false;

const initializeFirebaseServices = async () => {
  if (isInitialized) return;

  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
    
    // Wait for initial auth state
    await new Promise<void>((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('Initial auth state:', user ? `User logged in: ${user.email}` : 'No user');
        unsubscribe();
        resolve();
      }, (error) => {
        console.error('Auth state initialization error:', error);
        reject(error);
      });
    });
    
    db = getFirestore(app);
    console.log('Firestore initialized successfully');
    
    // Test Firestore connection
    const testDoc = doc(db, '_test', 'connectivity');
    try {
      await setDoc(testDoc, {
        timestamp: new Date(),
        test: 'connectivity'
      });
      console.log('Successfully wrote test document to Firestore');
      
      await deleteDoc(testDoc);
      console.log('Successfully cleaned up test document');
    } catch (testError) {
      console.error('Firestore connectivity test failed:', testError);
      throw testError;
    }

    isInitialized = true;
    console.log('Firebase services fully initialized');
  } catch (error) {
    console.error('Firebase services initialization error:', error);
    throw new Error('Failed to initialize Firebase services. Please check your configuration and network connection.');
  }
};

// Function to check Firestore rules
const checkFirestoreRules = async () => {
  try {
    // Try a test read
    const testRead = await getDocs(collection(db, 'papers'));
    console.log('Firestore read test:', testRead.empty ? 'Empty collection' : 'Collection accessible');

    // Try a test write
    const testDoc = doc(collection(db, '_test_rules'));
    await setDoc(testDoc, { test: true });
    await deleteDoc(testDoc);
    console.log('Firestore write test passed');

    return true;
  } catch (error) {
    console.error('Firestore rules test failed:', error);
    return false;
  }
};

// Initialize services immediately
initializeFirebaseServices()
  .then(() => checkFirestoreRules())
  .then(rulesOk => {
    if (!rulesOk) {
      console.error('Firestore rules check failed - permissions might be misconfigured');
    }
  })
  .catch(console.error);

export type { Auth, Firestore };
export { auth, db, initializeFirebaseServices, checkFirestoreRules };
export default app;

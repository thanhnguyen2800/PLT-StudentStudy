// lib/firebase.ts - Fixed with proper typing
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-c29XA94_xXDqr3oUbK3JGReR33AVAUo",
  authDomain: "student-study-7454c.firebaseapp.com",
  databaseURL: "https://student-study-7454c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "student-study-7454c",
  storageBucket: "student-study-7454c.firebasestorage.app",
  messagingSenderId: "620028815525",
  appId: "1:620028815525:web:3fd21625ee5c282053854c",
  measurementId: "G-4EW5NGL3VL"
};

// Debug: Check environment variables
console.log('🔍 DEBUG: Checking environment variables...');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 Project ID:', firebaseConfig.projectId);

// Initialize Firebase app
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services with proper typing
const database: Database = getDatabase(app);
const auth: Auth = getAuth(app);

// Initialize Firestore with explicit typing and error handling
let firestore: Firestore;
try {
  firestore = getFirestore(app);
  console.log('🔥 Firestore initialized successfully');
  console.log('🔥 Firestore project:', firestore.app.options.projectId);
} catch (error) {
  console.error('❌ Firestore initialization failed:', error);
  throw new Error(`Failed to initialize Firestore: ${error}`);
}

// Ensure firestore is properly initialized before proceeding
if (!firestore) {
  throw new Error('Firestore failed to initialize');
}

// Debug: Check if running in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Running in development mode');
  console.log('🔥 Firebase Auth Domain:', firebaseConfig.authDomain);
  console.log('🔥 Firebase Project ID:', firebaseConfig.projectId);
  
  // Connect to emulators in development (optional)
  // Uncomment these if you're using Firebase emulators
  /*
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    console.log('🔥 Connected to Firebase emulators');
  } catch (emulatorError) {
    console.warn('⚠️ Could not connect to emulators:', emulatorError);
  }
  */
}

console.log('🔥 Firebase initialized successfully');
console.log('🔥 Auth initialized:', !!auth);
console.log('🔥 Firestore initialized:', !!firestore);
console.log('🔥 Realtime Database initialized:', !!database);

// Export with proper types
export { database, auth };
export { firestore }; // Now properly typed as Firestore
export default app;
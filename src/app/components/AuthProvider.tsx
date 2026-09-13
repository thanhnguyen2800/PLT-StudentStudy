'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password';
const DEMO_STORAGE_KEY = 'student-study-demo-session';

const localDemoUser = {
  uid: 'local-demo-user',
  email: DEMO_EMAIL,
  emailVerified: false,
  displayName: 'Demo User',
  isAnonymous: false,
  phoneNumber: null,
  photoURL: null,
  providerId: 'password',
} as User;

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.localStorage.getItem(DEMO_STORAGE_KEY) === 'true') {
      setUser(localDemoUser);
      setLoading(false);
      return;
    }

    console.log('🔥 Setting up Firebase auth listener...');
    console.log('🔥 Auth instance:', !!auth);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🔥 Auth state change error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔥 Attempting to sign in user:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful:', result.user.email);
      setUser(result.user);
    } catch (error: any) {
      if (
        email.trim().toLowerCase() === DEMO_EMAIL &&
        password === DEMO_PASSWORD &&
          (error.code === 'auth/user-not-found' ||
            error.code === 'auth/invalid-credential' ||
            error.code === 'auth/api-key-not-valid')
      ) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            console.log('🧪 Demo account not found; creating it now');
            try {
              const result = await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
              console.log('✅ Demo account created:', result.user.email);
              setUser(result.user);
            } catch (createError: any) {
              if (createError.code === 'auth/email-already-in-use') {
                throw error;
              }
              throw createError;
            }
          } else {
            window.localStorage.setItem(DEMO_STORAGE_KEY, 'true');
            setUser(localDemoUser);
          }
        return;
      }

      console.error('❌ Sign in error:', error.code, error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('🔥 Attempting to create user:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ User created successfully:', result.user.email);
      
      // Send email verification
      await sendEmailVerification(result.user);
      console.log('📧 Email verification sent to:', result.user.email);
      
      setUser(result.user);
    } catch (error: any) {
      console.error('❌ Sign up error:', error.code, error.message);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      if (window.localStorage.getItem(DEMO_STORAGE_KEY) === 'true') {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
        setUser(null);
        return;
      }

      console.log('🔥 Signing out user...');
      await signOut(auth);
      console.log('✅ Sign out successful');
      setUser(null);
    } catch (error: any) {
      console.error('❌ Sign out error:', error.code, error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}
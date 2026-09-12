// src/hooks/useFirebaseData.ts
import { useState, useEffect } from 'react';
import { ref, onValue, off, set, push, remove, DatabaseReference } from 'firebase/database';
import { database } from '../lib/firebase';

export interface FirebaseHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  ref: DatabaseReference;
  updateData: (value: T) => Promise<void>;
  pushData: (value: any) => Promise<{ key: string | null }>;
  removeData: () => Promise<void>;
}

export function useFirebaseData<T = any>(path: string): FirebaseHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dbRef = ref(database, path);

  useEffect(() => {
    console.log(`🔌 Connecting to Firebase path: ${path}`);
    
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        try {
          const value = snapshot.val();
          console.log(`📊 Data received for ${path}:`, value);
          setData(value);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error(`❌ Error processing data for ${path}:`, err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      },
      (error) => {
        console.error(`❌ Firebase error for ${path}:`, error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log(`🔌 Disconnecting from Firebase path: ${path}`);
      off(dbRef, 'value', unsubscribe);
    };
  }, [path]);

  const updateData = async (value: T): Promise<void> => {
    try {
      console.log(`🔄 Updating ${path}:`, value);
      await set(dbRef, value);
      console.log(`✅ Updated ${path} successfully`);
    } catch (err) {
      console.error(`❌ Failed to update ${path}:`, err);
      throw err;
    }
  };

  const pushData = async (value: any): Promise<{ key: string | null }> => {
    try {
      console.log(`➕ Pushing to ${path}:`, value);
      const result = await push(dbRef, value);
      console.log(`✅ Pushed to ${path} with key:`, result.key);
      return { key: result.key };
    } catch (err) {
      console.error(`❌ Failed to push to ${path}:`, err);
      throw err;
    }
  };

  const removeData = async (): Promise<void> => {
    try {
      console.log(`🗑️ Removing ${path}`);
      await remove(dbRef);
      console.log(`✅ Removed ${path} successfully`);
    } catch (err) {
      console.error(`❌ Failed to remove ${path}:`, err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    ref: dbRef,
    updateData,
    pushData,
    removeData
  };
}
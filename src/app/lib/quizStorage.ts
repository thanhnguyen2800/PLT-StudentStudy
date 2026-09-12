// lib/quizStorage.ts
'use client';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { firestore } from './firebase';
import { Quiz } from '../types/game';

export interface StoredQuiz extends Quiz {
  id: string;
  userId: string;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  isPublic: boolean;
  timesPlayed: number;
  tags: string[];
}

export class QuizStorageService {
  // Save a quiz for a user
  static async saveQuiz(
    user: User, 
    quiz: Quiz, 
    isPublic: boolean = false, 
    tags: string[] = []
  ): Promise<string> {
    try {
      const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const quizRef = doc(firestore, 'quizzes', quizId);
      
      const storedQuiz: Omit<StoredQuiz, 'id'> = {
        ...quiz,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic,
        timesPlayed: 0,
        tags: tags || []
      };
      
      await setDoc(quizRef, storedQuiz);
      console.log('✅ Quiz saved successfully with ID:', quizId);
      return quizId;
    } catch (error) {
      console.error('❌ Error saving quiz:', error);
      throw error;
    }
  }

  // Get all quizzes for a user - with fallback for missing index
  static async getUserQuizzes(user: User): Promise<StoredQuiz[]> {
    try {
      let q;
      try {
        q = query(
          collection(firestore, 'quizzes'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );
      } catch (indexError) {
        console.warn('⚠️ Index not available, using basic query:', indexError);
        q = query(
          collection(firestore, 'quizzes'),
          where('userId', '==', user.uid)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const quizzes: StoredQuiz[] = [];
      
      querySnapshot.forEach((docSnapshot: DocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        if (data) {
          quizzes.push({
            id: docSnapshot.id,
            ...data
          } as StoredQuiz);
        }
      });

      // Sort client-side if we couldn't use orderBy
      if (!q.toString().includes('orderBy')) {
        quizzes.sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() || 0;
          const bTime = b.updatedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      }
      
      console.log(`📚 Retrieved ${quizzes.length} quizzes for user`);
      return quizzes;
    } catch (error) {
      console.error('❌ Error getting user quizzes:', error);
      throw error;
    }
  }

  // Get a specific quiz by ID
  static async getQuiz(quizId: string): Promise<StoredQuiz | null> {
    try {
      const quizRef = doc(firestore, 'quizzes', quizId);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        return {
          id: quizDoc.id,
          ...data
        } as StoredQuiz;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting quiz:', error);
      throw error;
    }
  }

  // Update a quiz
  static async updateQuiz(
    quizId: string, 
    updates: Partial<Quiz & { isPublic?: boolean; tags?: string[] }>
  ): Promise<void> {
    try {
      const quizRef = doc(firestore, 'quizzes', quizId);
      await updateDoc(quizRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Quiz updated successfully');
    } catch (error) {
      console.error('❌ Error updating quiz:', error);
      throw error;
    }
  }

  // Delete a quiz
  static async deleteQuiz(quizId: string): Promise<void> {
    try {
      const quizRef = doc(firestore, 'quizzes', quizId);
      await deleteDoc(quizRef);
      console.log('✅ Quiz deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      throw error;
    }
  }

  // Increment play count
  static async incrementPlayCount(quizId: string): Promise<void> {
    try {
      const quizRef = doc(firestore, 'quizzes', quizId);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        const currentCount = data?.timesPlayed || 0;
        await updateDoc(quizRef, {
          timesPlayed: currentCount + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Error incrementing play count:', error);
      // Don't throw here - this is not critical functionality
    }
  }

  // Get public quizzes with fallback for missing index
  static async getPublicQuizzes(limitCount: number = 20): Promise<StoredQuiz[]> {
    try {
      let q;
      
      try {
        // Try the query that requires the composite index
        q = query(
          collection(firestore, 'quizzes'),
          where('isPublic', '==', true),
          orderBy('timesPlayed', 'desc'),
          firestoreLimit(limitCount)
        );
      } catch (indexError) {
        console.warn('⚠️ Composite index not available, using basic query');
        // Fallback to simple query without orderBy
        q = query(
          collection(firestore, 'quizzes'),
          where('isPublic', '==', true),
          firestoreLimit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const quizzes: StoredQuiz[] = [];
      
      querySnapshot.forEach((docSnapshot: DocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        if (data) {
          quizzes.push({
            id: docSnapshot.id,
            ...data
          } as StoredQuiz);
        }
      });

      // If we couldn't sort by timesPlayed in the query, sort client-side
      if (!q.toString().includes('orderBy')) {
        quizzes.sort((a, b) => (b.timesPlayed || 0) - (a.timesPlayed || 0));
      }
      
      console.log(`🌍 Retrieved ${quizzes.length} public quizzes`);
      return quizzes;
    } catch (error) {
      console.error('❌ Error getting public quizzes:', error);
      throw error;
    }
  }

  // Get public quizzes by tags (requires separate index)
  static async getPublicQuizzesByTag(tag: string, limitCount: number = 20): Promise<StoredQuiz[]> {
    try {
      const q = query(
        collection(firestore, 'quizzes'),
        where('isPublic', '==', true),
        where('tags', 'array-contains', tag),
        firestoreLimit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const quizzes: StoredQuiz[] = [];
      
      querySnapshot.forEach((docSnapshot: DocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        if (data) {
          quizzes.push({
            id: docSnapshot.id,
            ...data
          } as StoredQuiz);
        }
      });
      
      // Sort by timesPlayed client-side
      quizzes.sort((a, b) => (b.timesPlayed || 0) - (a.timesPlayed || 0));
      
      return quizzes;
    } catch (error) {
      console.error('❌ Error getting quizzes by tag:', error);
      throw error;
    }
  }

  // Search quizzes by title (for your existing Quiz structure)
  static async searchQuizzes(searchTerm: string, limitCount: number = 20): Promise<StoredQuiz[]> {
    try {
      // Note: This is a basic search. For better search, consider using Algolia or similar
      const q = query(
        collection(firestore, 'quizzes'),
        where('isPublic', '==', true),
        firestoreLimit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const quizzes: StoredQuiz[] = [];
      
      querySnapshot.forEach((docSnapshot: DocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        if (data && data.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
          quizzes.push({
            id: docSnapshot.id,
            ...data
          } as StoredQuiz);
        }
      });
      
      return quizzes;
    } catch (error) {
      console.error('❌ Error searching quizzes:', error);
      throw error;
    }
  }
}
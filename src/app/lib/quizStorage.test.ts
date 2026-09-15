import { afterEach, describe, expect, it, vi } from 'vitest';

const { firestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, where, orderBy, firestoreLimit, serverTimestamp } = vi.hoisted(() => ({
  firestore: {},
  collection: vi.fn(() => 'quizzes-collection'),
  doc: vi.fn((_db: unknown, _collection: string, id: string) => ({ id })),
  setDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn((...parts: unknown[]) => ({ parts, toString: () => parts.join(' ') })),
  where: vi.fn((...args: unknown[]) => `where:${args.join(':')}`),
  orderBy: vi.fn((...args: unknown[]) => `orderBy:${args.join(':')}`),
  firestoreLimit: vi.fn((count: number) => `limit:${count}`),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('firebase/firestore', () => ({
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
  limit: firestoreLimit,
  serverTimestamp,
}));
vi.mock('../lib/firebase', () => ({ firestore }));

import { QuizStorageService } from './quizStorage';

const user = { uid: 'user-1', emailVerified: true } as Parameters<typeof QuizStorageService.saveQuiz>[0];
const quiz = { title: 'Science', questions: [{ question: 'H2O?', options: ['Water', 'Air'], correct: 0, time: 10 }] };

const documentSnapshot = (id: string, data: Record<string, unknown>) => ({
  id,
  data: () => data,
});

afterEach(() => vi.clearAllMocks());

describe('QuizStorageService.saveQuiz', () => {
  it('rejects users who have not verified email', async () => {
    await expect(QuizStorageService.saveQuiz({ uid: 'user-1', emailVerified: false } as typeof user, quiz)).rejects.toThrow('EMAIL_NOT_VERIFIED');
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('saves quiz metadata and returns generated id', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(123);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    await expect(QuizStorageService.saveQuiz(user, quiz, true, ['math'])).resolves.toBe('quiz_123_i');
    expect(setDoc).toHaveBeenCalledWith(
      { id: 'quiz_123_i' },
      expect.objectContaining({ ...quiz, userId: 'user-1', isPublic: true, timesPlayed: 0, tags: ['math'] }),
    );
  });
});

describe('QuizStorageService reads and writes', () => {
  it('returns a quiz or null when fetching by id', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => true, id: 'q1', data: () => ({ title: 'Quiz' }) });
    await expect(QuizStorageService.getQuiz('q1')).resolves.toEqual({ id: 'q1', title: 'Quiz' });

    getDoc.mockResolvedValueOnce({ exists: () => false });
    await expect(QuizStorageService.getQuiz('missing')).resolves.toBeNull();
  });

  it('gets user quizzes sorted by updatedAt descending', async () => {
    getDocs.mockResolvedValue({ forEach: (callback: (snapshot: unknown) => void) => {
      callback(documentSnapshot('old', { updatedAt: { toMillis: () => 1 } }));
      callback(documentSnapshot('new', { updatedAt: { toMillis: () => 2 } }));
    } });

    await expect(QuizStorageService.getUserQuizzes(user)).resolves.toEqual([
      { id: 'new', updatedAt: { toMillis: expect.any(Function) } },
      { id: 'old', updatedAt: { toMillis: expect.any(Function) } },
    ]);
  });

  it('updates and deletes a quiz', async () => {
    await QuizStorageService.updateQuiz('q1', { title: 'Updated' });
    await QuizStorageService.deleteQuiz('q1');

    expect(updateDoc).toHaveBeenCalledWith({ id: 'q1' }, { title: 'Updated', updatedAt: 'SERVER_TIMESTAMP' });
    expect(deleteDoc).toHaveBeenCalledWith({ id: 'q1' });
  });

  it('increments play count only when the quiz exists', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ timesPlayed: 4 }) });
    await QuizStorageService.incrementPlayCount('q1');
    expect(updateDoc).toHaveBeenCalledWith({ id: 'q1' }, { timesPlayed: 5, updatedAt: 'SERVER_TIMESTAMP' });

    getDoc.mockResolvedValueOnce({ exists: () => false });
    await QuizStorageService.incrementPlayCount('missing');
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});

describe('QuizStorageService public queries', () => {
  it('gets public quizzes and applies the requested limit', async () => {
    getDocs.mockResolvedValue({ forEach: (callback: (snapshot: unknown) => void) => {
      callback(documentSnapshot('q1', { title: 'Popular', timesPlayed: 3 }));
    } });

    await expect(QuizStorageService.getPublicQuizzes(5)).resolves.toEqual([
      { id: 'q1', title: 'Popular', timesPlayed: 3 },
    ]);
    expect(firestoreLimit).toHaveBeenCalledWith(5);
  });

  it('falls back when the ordered public query cannot be built', async () => {
    query.mockImplementationOnce(() => { throw new Error('missing index'); });
    getDocs.mockResolvedValue({ forEach: (callback: (snapshot: unknown) => void) => {
      callback(documentSnapshot('q1', { title: 'Quiz', timesPlayed: 1 }));
    } });

    await expect(QuizStorageService.getPublicQuizzes()).resolves.toHaveLength(1);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('gets public quizzes by tag and sorts by play count', async () => {
    getDocs.mockResolvedValue({ forEach: (callback: (snapshot: unknown) => void) => {
      callback(documentSnapshot('low', { tags: ['science'], timesPlayed: 1 }));
      callback(documentSnapshot('high', { tags: ['science'], timesPlayed: 5 }));
    } });

    await expect(QuizStorageService.getPublicQuizzesByTag('science')).resolves.toEqual([
      { id: 'high', tags: ['science'], timesPlayed: 5 },
      { id: 'low', tags: ['science'], timesPlayed: 1 },
    ]);
  });

  it('searches public quiz titles case-insensitively', async () => {
    getDocs.mockResolvedValue({ forEach: (callback: (snapshot: unknown) => void) => {
      callback(documentSnapshot('match', { title: 'JavaScript Basics' }));
      callback(documentSnapshot('other', { title: 'History' }));
    } });

    await expect(QuizStorageService.searchQuizzes('SCRIPT')).resolves.toEqual([
      { id: 'match', title: 'JavaScript Basics' },
    ]);
  });
});
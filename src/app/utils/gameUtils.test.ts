import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calculateScore,
  generateGamePin,
  generatePlayerId,
  getLeaderboard,
  validateQuiz,
} from './gameUtils';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateGamePin', () => {
  it('generates a six-digit numeric PIN', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(generateGamePin()).toBe('550000');
  });
});

describe('generatePlayerId', () => {
  it('includes the timestamp and a random suffix', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(generatePlayerId()).toMatch(/^player_1700000000000_[a-z0-9]+$/);
  });
});

describe('validateQuiz', () => {
  const validQuiz = {
    title: 'Science',
    questions: [
      {
        question: 'What is H2O?',
        options: ['Water', 'Oxygen'],
        correct: 0,
        time: 20,
      },
    ],
  };

  it('accepts a valid quiz', () => {
    expect(validateQuiz(validQuiz)).toBe(true);
  });

  it.each([
    ['a missing title', { ...validQuiz, title: '' }, 'Quiz must have a title'],
    ['no questions', { ...validQuiz, questions: [] }, 'Quiz must have at least one question'],
    [
      'too few options',
      { ...validQuiz, questions: [{ ...validQuiz.questions[0], options: ['Water'] }] },
      'Question 1 must have at least 2 options',
    ],
    [
      'an invalid correct index',
      { ...validQuiz, questions: [{ ...validQuiz.questions[0], correct: 2 }] },
      'Question 1 must have a valid correct answer index',
    ],
    [
      'a non-positive time limit',
      { ...validQuiz, questions: [{ ...validQuiz.questions[0], time: 0 }] },
      'Question 1 must have a positive time limit',
    ],
  ])('rejects %s', (_description, quiz, errorMessage) => {
    expect(() => validateQuiz(quiz)).toThrow(errorMessage);
  });

  it('rejects a non-object quiz', () => {
    expect(() => validateQuiz(null)).toThrow('Quiz must be an object');
  });
});

describe('calculateScore', () => {
  it('returns zero for an incorrect answer', () => {
    expect(calculateScore(false, 1000, 20)).toBe(0);
  });

  it('adds a time bonus for a correct answer', () => {
    vi.spyOn(Date, 'now').mockReturnValue(10800);

    expect(calculateScore(true, 1000, 20)).toBe(210);
  });

  it('does not give a negative time bonus', () => {
    vi.spyOn(Date, 'now').mockReturnValue(31000);

    expect(calculateScore(true, 1000, 20)).toBe(100);
  });
});

describe('getLeaderboard', () => {
  it('sorts players by score and assigns one-based ranks', () => {
    const leaderboard = getLeaderboard({
      playerA: { name: 'An', score: 100, answers: {}, joinedAt: 1 },
      playerB: { name: 'Binh', score: 250, answers: {}, joinedAt: 2 },
      playerC: { name: 'Chi', score: 0, answers: {}, joinedAt: 3 },
    });

    expect(leaderboard).toEqual([
      { playerId: 'playerB', playerName: 'Binh', score: 250, rank: 1 },
      { playerId: 'playerA', playerName: 'An', score: 100, rank: 2 },
      { playerId: 'playerC', playerName: 'Chi', score: 0, rank: 3 },
    ]);
  });
});
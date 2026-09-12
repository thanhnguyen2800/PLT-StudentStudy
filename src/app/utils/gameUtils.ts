// src/utils/gameUtils.ts
import { Quiz, Player, LeaderboardEntry } from '../types/game';

export const generateGamePin = (): string => {
  // Generate a 6-digit numeric PIN (100000 to 999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generatePlayerId = (): string => {
  return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const validateQuiz = (quiz: any): quiz is Quiz => {
  if (!quiz || typeof quiz !== 'object') {
    throw new Error('Quiz must be an object');
  }

  if (!quiz.title || typeof quiz.title !== 'string') {
    throw new Error('Quiz must have a title');
  }

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error('Quiz must have at least one question');
  }

  quiz.questions.forEach((question: any, index: number) => {
    if (!question.question || typeof question.question !== 'string') {
      throw new Error(`Question ${index + 1} must have a question text`);
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Question ${index + 1} must have at least 2 options`);
    }

    if (typeof question.correct !== 'number' || question.correct < 0 || question.correct >= question.options.length) {
      throw new Error(`Question ${index + 1} must have a valid correct answer index`);
    }

    if (!question.time || typeof question.time !== 'number' || question.time <= 0) {
      throw new Error(`Question ${index + 1} must have a positive time limit`);
    }
  });

  return true;
};

export const calculateScore = (
  isCorrect: boolean,
  questionStartTime: number,
  timeLimit: number
): number => {
  if (!isCorrect) return 0;

  const timeElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
  const timeBonus = Math.max(0, timeLimit - timeElapsed);
  const baseScore = 100;
  const bonusMultiplier = 10;

  return baseScore + (timeBonus * bonusMultiplier);
};

export const getLeaderboard = (players: { [key: string]: Player }): LeaderboardEntry[] => {
  return Object.entries(players)
    .map(([playerId, player]) => ({
      playerId,
      playerName: player.name,
      score: player.score || 0,
      rank: 0
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
};

export const sampleQuiz: Quiz = {
  title: "General Knowledge Quiz",
  questions: [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      time: 20
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      time: 15
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1,
      time: 10
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
      correct: 2,
      time: 20
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Pacific", "Indian", "Arctic"],
      correct: 1,
      time: 15
    }
  ]
};
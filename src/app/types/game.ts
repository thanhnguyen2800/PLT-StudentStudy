// types/game.ts - Extended with cleanup tracking fields

export interface Question {
  question: string;
  options: string[];
  correct: number;
  time: number;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface Player {
  name: string;
  score: number;
  answers: { [questionIndex: number]: number };
  joinedAt: number;
  lastSeen?: number;  // Added for cleanup tracking
}

export interface Game {
  quiz: Quiz;
  status: 'waiting' | 'question' | 'results' | 'finished';
  players: { [playerId: string]: Player };
  currentQuestion: number;
  createdAt: number;
  questionStartTime?: number;
  host: string;
  
  // Additional cleanup tracking fields
  lastActivity?: number;         // Timestamp of last activity
  hostHeartbeat?: number;        // Last host activity ping
  isHostActive?: boolean;        // Whether host is currently active
  cleanupScheduled?: boolean;    // Whether cleanup is scheduled
  cleanupReason?: string;        // Reason for cleanup
}

export interface GamePin {
  pin: string;
}

export type GameStatus = 'waiting' | 'question' | 'results' | 'finished';

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

// Cleanup configuration interface
export interface GameCleanupSettings {
  waitingTimeout: number;    // How long to wait in lobby (default: 10 min)
  inactiveTimeout: number;   // How long to wait for activity (default: 30 min)
  finishedTimeout: number;   // How long to keep finished games (default: 5 min)
  abandonedTimeout: number;  // How long to keep abandoned games (default: 15 min)
  heartbeatInterval: number; // How often to send activity pings (default: 2 min)
}

// Default cleanup settings
export const defaultCleanupSettings: GameCleanupSettings = {
  waitingTimeout: 10 * 60 * 1000,      // 10 minutes
  inactiveTimeout: 30 * 60 * 1000,     // 30 minutes  
  finishedTimeout: 5 * 60 * 1000,      // 5 minutes
  abandonedTimeout: 15 * 60 * 1000,    // 15 minutes
  heartbeatInterval: 2 * 60 * 1000,    // 2 minutes
};

// Game status for cleanup purposes
export type GameCleanupStatus = 
  | 'waiting'      // Waiting for players to join
  | 'active'       // Game is being played  
  | 'finished'     // Game completed
  | 'abandoned'    // Host left/disconnected
  | 'expired';     // Timeout reached

// Utility type for game updates that affect cleanup
export interface GameActivityUpdate {
  status?: GameStatus;
  lastActivity?: number;
  hostHeartbeat?: number;
  isHostActive?: boolean;
  currentQuestion?: number;
  questionStartTime?: number;
}
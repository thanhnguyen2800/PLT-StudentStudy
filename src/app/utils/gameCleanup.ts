// utils/gameCleanup.ts
import { ref, remove, get, set } from 'firebase/database';
import { database } from '../lib/firebase';

export interface CleanupConfig {
  waitingTimeout: number;    // Time to wait for players to join (default: 10 minutes)
  inactiveTimeout: number;   // Time to wait for activity during game (default: 30 minutes)
  finishedTimeout: number;   // Time to keep finished games (default: 5 minutes)
  abandonedTimeout: number;  // Time to keep games with no host activity (default: 15 minutes)
}

const defaultConfig: CleanupConfig = {
  waitingTimeout: 10 * 60 * 1000,     // 10 minutes
  inactiveTimeout: 30 * 60 * 1000,    // 30 minutes
  finishedTimeout: 5 * 60 * 1000,     // 5 minutes
  abandonedTimeout: 15 * 60 * 1000,   // 15 minutes
};

export class GameCleanupManager {
  private cleanupIntervals: Map<string, NodeJS.Timeout> = new Map();
  private config: CleanupConfig;

  constructor(config: Partial<CleanupConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Schedule cleanup for a specific game based on its current status
   */
  scheduleCleanup(gamePin: string, status: string, lastActivity?: number) {
    // Clear any existing cleanup for this game
    this.cancelCleanup(gamePin);

    const now = Date.now();
    let timeout: number;
    let reason: string;

    switch (status) {
      case 'waiting':
        timeout = this.config.waitingTimeout;
        reason = 'waiting too long for players';
        break;
      case 'question':
      case 'results':
        timeout = this.config.inactiveTimeout;
        reason = 'game inactive for too long';
        break;
      case 'finished':
        timeout = this.config.finishedTimeout;
        reason = 'game completed';
        break;
      default:
        timeout = this.config.abandonedTimeout;
        reason = 'unknown status - likely abandoned';
    }

    // If we have lastActivity, check if cleanup should happen sooner
    if (lastActivity) {
      const timeSinceActivity = now - lastActivity;
      const remainingTime = timeout - timeSinceActivity;
      
      if (remainingTime <= 0) {
        // Should be cleaned up immediately
        this.cleanupGame(gamePin, `immediate cleanup - ${reason}`);
        return;
      }
      
      timeout = remainingTime;
    }

    console.log(`🗑️ Scheduling cleanup for game ${gamePin} in ${Math.round(timeout / 1000)}s (${reason})`);

    const timeoutId = setTimeout(() => {
      this.cleanupGame(gamePin, reason);
    }, timeout);

    this.cleanupIntervals.set(gamePin, timeoutId);
  }

  /**
   * Cancel scheduled cleanup for a game
   */
  cancelCleanup(gamePin: string) {
    const existingTimeout = this.cleanupIntervals.get(gamePin);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.cleanupIntervals.delete(gamePin);
      console.log(`✅ Cancelled cleanup for game ${gamePin}`);
    }
  }

  /**
   * Immediately clean up a specific game
   */
  async cleanupGame(gamePin: string, reason: string = 'manual cleanup') {
    try {
      console.log(`🗑️ Cleaning up game ${gamePin}: ${reason}`);
      
      // Remove from scheduled cleanups
      this.cancelCleanup(gamePin);
      
      // Delete from Firebase
      const gameRef = ref(database, `games/${gamePin}`);
      await remove(gameRef);
      
      console.log(`✅ Game ${gamePin} successfully removed from Firebase (${reason})`);
    } catch (error) {
      console.error(`❌ Error cleaning up game ${gamePin}:`, error);
    }
  }

  /**
   * Update the last activity timestamp for a game
   */
  updateActivity(gamePin: string, status: string) {
    console.log(`🔄 Activity updated for game ${gamePin} (status: ${status})`);
    
    // Reschedule cleanup with updated activity
    this.scheduleCleanup(gamePin, status, Date.now());
  }

  /**
   * Scan for and cleanup old/abandoned games (run periodically)
   */
  async scanAndCleanupOldGames() {
    try {
      console.log('🔍 Scanning for old games to cleanup...');
      
      const gamesRef = ref(database, 'games');
      const snapshot = await get(gamesRef);
      
      if (!snapshot.exists()) {
        console.log('📭 No games found in database');
        return;
      }

      const games = snapshot.val();
      const now = Date.now();
      let cleanedCount = 0;

      for (const [gamePin, gameData] of Object.entries(games) as [string, any][]) {
        const { status, createdAt, questionStartTime, lastActivity } = gameData;
        
        // Determine the most recent activity time
        const mostRecentActivity = Math.max(
          createdAt || 0,
          questionStartTime || 0,
          lastActivity || 0
        );

        const timeSinceActivity = now - mostRecentActivity;
        let shouldCleanup = false;
        let reason = '';

        switch (status) {
          case 'waiting':
            if (timeSinceActivity > this.config.waitingTimeout) {
              shouldCleanup = true;
              reason = 'waiting room expired';
            }
            break;
          case 'question':
          case 'results':
            if (timeSinceActivity > this.config.inactiveTimeout) {
              shouldCleanup = true;
              reason = 'game inactive too long';
            }
            break;
          case 'finished':
            if (timeSinceActivity > this.config.finishedTimeout) {
              shouldCleanup = true;
              reason = 'finished game cleanup';
            }
            break;
          default:
            if (timeSinceActivity > this.config.abandonedTimeout) {
              shouldCleanup = true;
              reason = 'abandoned game';
            }
        }

        if (shouldCleanup) {
          await this.cleanupGame(gamePin, reason);
          cleanedCount++;
        }
      }

      console.log(`🧹 Cleanup scan complete: ${cleanedCount} games removed`);
    } catch (error) {
      console.error('❌ Error during cleanup scan:', error);
    }
  }

  /**
   * Start periodic cleanup scans
   */
  startPeriodicCleanup(intervalMinutes: number = 5) {
    console.log(`🔄 Starting periodic cleanup every ${intervalMinutes} minutes`);
    
    setInterval(() => {
      this.scanAndCleanupOldGames();
    }, intervalMinutes * 60 * 1000);

    // Run initial cleanup
    this.scanAndCleanupOldGames();
  }

  /**
   * Cleanup all scheduled timeouts (call when app is closing)
   */
  cleanup() {
    console.log('🧹 Cleaning up all scheduled game cleanups');
    for (const timeout of this.cleanupIntervals.values()) {
      clearTimeout(timeout);
    }
    this.cleanupIntervals.clear();
  }
}

// Create a global instance
export const gameCleanupManager = new GameCleanupManager();

// Utility function to update game activity timestamp in Firebase
export async function updateGameActivity(gamePin: string, additionalData: any = {}) {
  try {
    const gameRef = ref(database, `games/${gamePin}`);
    const snapshot = await get(gameRef);
    
    if (snapshot.exists()) {
      const currentData = snapshot.val();
      const updatedData = {
        ...currentData,
        ...additionalData,
        lastActivity: Date.now()
      };
      
      // Update the game data in Firebase
      await set(gameRef, updatedData);
      
      // Update cleanup schedule
      gameCleanupManager.updateActivity(gamePin, updatedData.status);
      
      return updatedData;
    }
  } catch (error) {
    console.error(`❌ Error updating game activity for ${gamePin}:`, error);
  }
}
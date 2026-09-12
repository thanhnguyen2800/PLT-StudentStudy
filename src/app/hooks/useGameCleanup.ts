// hooks/useGameCleanup.ts
import { useEffect, useCallback, useRef } from 'react';
import { gameCleanupManager, updateGameActivity } from '../utils/gameCleanup';

export interface UseGameCleanupOptions {
  gamePin: string;
  status: string;
  enabled?: boolean;
  heartbeatInterval?: number; // in milliseconds
  onGameDeleted?: () => void;
}

export function useGameCleanup({
  gamePin,
  status,
  enabled = true,
  heartbeatInterval = 2 * 60 * 1000, // 2 minutes
  onGameDeleted
}: UseGameCleanupOptions) {
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Send activity heartbeat to prevent auto-cleanup
  const sendHeartbeat = useCallback(() => {
    if (enabled && gamePin && isActiveRef.current) {
      updateGameActivity(gamePin, {
        status,
        hostHeartbeat: Date.now(),
        isHostActive: true
      });
      console.log(`💓 Activity heartbeat sent for game ${gamePin} (status: ${status})`);
    }
  }, [gamePin, status, enabled]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (!enabled) return;

    // Clear existing heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    // Send initial heartbeat
    sendHeartbeat();

    // Schedule regular heartbeats
    heartbeatRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    
    console.log(`💓 Started heartbeat for game ${gamePin} every ${heartbeatInterval / 1000}s`);
  }, [sendHeartbeat, heartbeatInterval, enabled, gamePin]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
      console.log(`💓 Stopped heartbeat for game ${gamePin}`);
    }
  }, [gamePin]);

  // Schedule cleanup for the game
  const scheduleCleanup = useCallback((customStatus?: string) => {
    if (!enabled) return;
    
    const cleanupStatus = customStatus || status;
    gameCleanupManager.scheduleCleanup(gamePin, cleanupStatus);
    console.log(`🗑️ Scheduled cleanup for game ${gamePin} (status: ${cleanupStatus})`);
  }, [gamePin, status, enabled]);

  // Cancel cleanup for the game
  const cancelCleanup = useCallback(() => {
    gameCleanupManager.cancelCleanup(gamePin);
    console.log(`✅ Cancelled cleanup for game ${gamePin}`);
  }, [gamePin]);

  // Manually cleanup the game
  const cleanupNow = useCallback(async () => {
    isActiveRef.current = false;
    stopHeartbeat();
    await gameCleanupManager.cleanupGame(gamePin, 'manual host cleanup');
    
    if (onGameDeleted) {
      onGameDeleted();
    }
  }, [gamePin, stopHeartbeat, onGameDeleted]);

  // Mark host as inactive (stops heartbeat but doesn't delete game immediately)
  const markInactive = useCallback(() => {
    isActiveRef.current = false;
    stopHeartbeat();
    
    // Schedule cleanup based on current status
    scheduleCleanup();
    
    console.log(`😴 Marked game ${gamePin} as inactive`);
  }, [stopHeartbeat, scheduleCleanup, gamePin]);

  // Mark host as active again
  const markActive = useCallback(() => {
    isActiveRef.current = true;
    cancelCleanup();
    startHeartbeat();
    
    console.log(`✅ Marked game ${gamePin} as active`);
  }, [cancelCleanup, startHeartbeat, gamePin]);

  // Update game activity with custom data
  const updateActivity = useCallback((additionalData: any = {}) => {
    if (!enabled) return;
    
    updateGameActivity(gamePin, {
      status,
      hostHeartbeat: Date.now(),
      isHostActive: isActiveRef.current,
      ...additionalData
    });
  }, [gamePin, status, enabled]);

  // Initialize cleanup on mount
  useEffect(() => {
    if (enabled && gamePin) {
      startHeartbeat();
      
      // Handle page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          markInactive();
        } else {
          markActive();
        }
      };

      // Handle page unload
      const handleBeforeUnload = () => {
        markInactive();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        markInactive();
      };
    }
  }, [enabled, gamePin, startHeartbeat, markInactive, markActive]);

  // Update cleanup schedule when status changes
  useEffect(() => {
    if (enabled && gamePin && isActiveRef.current) {
      // Cancel old cleanup and schedule new one for updated status
      cancelCleanup();
      scheduleCleanup();
      
      // Send activity update with new status
      updateActivity();
    }
  }, [status, enabled, gamePin, cancelCleanup, scheduleCleanup, updateActivity]);

  return {
    scheduleCleanup,
    cancelCleanup,
    cleanupNow,
    markActive,
    markInactive,
    updateActivity,
    sendHeartbeat,
    isActive: isActiveRef.current
  };
}
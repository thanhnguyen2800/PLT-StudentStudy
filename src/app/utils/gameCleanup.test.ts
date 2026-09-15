import { afterEach, describe, expect, it, vi } from 'vitest';

const { database, remove, get, set, ref } = vi.hoisted(() => ({
  database: {},
  remove: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
  ref: vi.fn((_database: unknown, path: string) => ({ path })),
}));

vi.mock('firebase/database', () => ({ ref, remove, get, set }));
vi.mock('../lib/firebase', () => ({ database }));

import { GameCleanupManager, updateGameActivity } from './gameCleanup';

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('GameCleanupManager', () => {
  it('uses the waiting timeout for a waiting game', () => {
    vi.useFakeTimers();
    const manager = new GameCleanupManager({ waitingTimeout: 1000 });
    const cleanup = vi.spyOn(manager, 'cleanupGame').mockResolvedValue();

    manager.scheduleCleanup('123456', 'waiting');
    vi.advanceTimersByTime(999);
    expect(cleanup).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(cleanup).toHaveBeenCalledWith('123456', 'waiting too long for players');
  });

  it('reschedules cleanup using the remaining time after activity', () => {
    vi.useFakeTimers();
    vi.setSystemTime(10000);
    const manager = new GameCleanupManager({ waitingTimeout: 1000 });
    const cleanup = vi.spyOn(manager, 'cleanupGame').mockResolvedValue();

    manager.scheduleCleanup('123456', 'waiting', 9500);
    vi.advanceTimersByTime(499);
    expect(cleanup).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('cleans up immediately when the activity has expired', () => {
    vi.useFakeTimers();
    vi.setSystemTime(10000);
    const manager = new GameCleanupManager({ waitingTimeout: 1000 });
    const cleanup = vi.spyOn(manager, 'cleanupGame').mockResolvedValue();

    manager.scheduleCleanup('123456', 'waiting', 8000);
    expect(cleanup).toHaveBeenCalledWith('123456', 'immediate cleanup - waiting too long for players');
  });

  it('cancels an existing timeout', () => {
    vi.useFakeTimers();
    const manager = new GameCleanupManager({ waitingTimeout: 1000 });
    const cleanup = vi.spyOn(manager, 'cleanupGame').mockResolvedValue();

    manager.scheduleCleanup('123456', 'waiting');
    manager.cancelCleanup('123456');
    vi.advanceTimersByTime(1000);

    expect(cleanup).not.toHaveBeenCalled();
  });

  it('removes a game from Firebase', async () => {
    const manager = new GameCleanupManager();

    await manager.cleanupGame('123456', 'manual');

    expect(ref).toHaveBeenCalledWith(database, 'games/123456');
    expect(remove).toHaveBeenCalledWith({ path: 'games/123456' });
  });

  it('scans and removes only expired games', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(10000);
    get.mockResolvedValue({
      exists: () => true,
      val: () => ({
        old: { status: 'waiting', createdAt: 0 },
        recent: { status: 'waiting', createdAt: 9500 },
      }),
    });
    const manager = new GameCleanupManager({ waitingTimeout: 1000 });
    const cleanup = vi.spyOn(manager, 'cleanupGame').mockResolvedValue();

    await manager.scanAndCleanupOldGames();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledWith('old', 'waiting room expired');
  });
});

describe('updateGameActivity', () => {
  it('merges Firebase data, updates lastActivity and reschedules cleanup', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);
    get.mockResolvedValue({ exists: () => true, val: () => ({ status: 'question', score: 1 }) });
    const manager = new GameCleanupManager();
    const updateActivity = vi.spyOn(manager, 'updateActivity').mockImplementation(() => undefined);

    const module = await import('./gameCleanup');
    module.gameCleanupManager.updateActivity = updateActivity;
    const result = await updateGameActivity('123456', { score: 2 });

    expect(result).toEqual({ status: 'question', score: 2, lastActivity: 12345 });
    expect(set).toHaveBeenCalledWith({ path: 'games/123456' }, result);
    expect(updateActivity).toHaveBeenCalledWith('123456', 'question');
  });

  it('does nothing when the game does not exist', async () => {
    get.mockResolvedValue({ exists: () => false });

    await expect(updateGameActivity('missing')).resolves.toBeUndefined();
    expect(set).not.toHaveBeenCalled();
  });
});
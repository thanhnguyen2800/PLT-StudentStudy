import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { database, dbRef, ref, onValue, off, set, push, remove } = vi.hoisted(() => {
  const reference = { key: 'test' };
  return {
    database: {},
    dbRef: reference,
    ref: vi.fn(() => reference),
    onValue: vi.fn(),
    off: vi.fn(),
    set: vi.fn().mockResolvedValue(undefined),
    push: vi.fn().mockResolvedValue({ key: 'new-key' }),
    remove: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('firebase/database', () => ({ ref, onValue, off, set, push, remove }));
vi.mock('../lib/firebase', () => ({ database }));

import { useFirebaseData } from './useFirebaseData';

afterEach(() => vi.clearAllMocks());

describe('useFirebaseData', () => {
  it('loads and stores values from Firebase', async () => {
    onValue.mockImplementation((_ref, success) => {
      success({ val: () => ({ name: 'Quiz' }) });
      return vi.fn();
    });

    const { result } = renderHook(() => useFirebaseData<{ name: string }>('games/1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ name: 'Quiz' });
    expect(result.current.error).toBeNull();
  });

  it('exposes Firebase listener errors', async () => {
    onValue.mockImplementation((_ref, _success, failure) => {
      failure(new Error('permission denied'));
      return vi.fn();
    });

    const { result } = renderHook(() => useFirebaseData('games/1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('permission denied');
  });

  it('unsubscribes when the path changes and on unmount', () => {
    const unsubscribe = vi.fn();
    onValue.mockReturnValue(unsubscribe);
    const { rerender, unmount } = renderHook(({ path }) => useFirebaseData(path), {
      initialProps: { path: 'games/1' },
    });

    rerender({ path: 'games/2' });
    unmount();

    expect(off).toHaveBeenCalledTimes(2);
    expect(off).toHaveBeenCalledWith(dbRef, 'value', unsubscribe);
  });

  it('updates, pushes and removes data', async () => {
    const { result } = renderHook(() => useFirebaseData<{ value: number }>('games/1'));

    await act(async () => {
      await result.current.updateData({ value: 1 });
      await expect(result.current.pushData({ value: 2 })).resolves.toEqual({ key: 'new-key' });
      await result.current.removeData();
    });

    expect(set).toHaveBeenCalledWith(dbRef, { value: 1 });
    expect(push).toHaveBeenCalledWith(dbRef, { value: 2 });
    expect(remove).toHaveBeenCalledWith(dbRef);
  });

  it('propagates write errors', async () => {
    set.mockRejectedValueOnce(new Error('write failed'));
    const { result } = renderHook(() => useFirebaseData('games/1'));

    await expect(result.current.updateData('value')).rejects.toThrow('write failed');
  });
});
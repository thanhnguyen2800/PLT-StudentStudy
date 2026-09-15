import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { database, get, set, ref, generatePlayerId } = vi.hoisted(() => ({
  database: {},
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
  ref: vi.fn((_database: unknown, path: string) => ({ path })),
  generatePlayerId: vi.fn(() => 'player-test'),
}));

vi.mock('firebase/database', () => ({ database, get, set, ref }));
vi.mock('../utils/gameUtils', () => ({ generatePlayerId }));
vi.mock('../lib/firebase', () => ({ database }));

import PlayerJoin from './PlayerJoin';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PlayerJoin', () => {
  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText('Nhập mã PIN 6 chữ số'), { target: { value: '123abc4567' } });
    fireEvent.change(screen.getByPlaceholderText('Nhập tên của bạn'), { target: { value: ' An ' } });
  };

  it('keeps join disabled until PIN and name are valid', () => {
    render(<PlayerJoin onJoinGame={vi.fn()} />);
    const button = screen.getByRole('button', { name: /Tham gia phòng chơi/i });

    expect(button).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Nhập mã PIN 6 chữ số'), { target: { value: '123456' } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Nhập tên của bạn'), { target: { value: 'An' } });
    expect(button).not.toBeDisabled();
  });

  it('filters PIN digits and trims the player name', () => {
    render(<PlayerJoin onJoinGame={vi.fn()} />);
    const pin = screen.getByPlaceholderText('Nhập mã PIN 6 chữ số') as HTMLInputElement;
    const name = screen.getByPlaceholderText('Nhập tên của bạn') as HTMLInputElement;

    fireEvent.change(pin, { target: { value: '12x34-56789' } });
    fireEvent.change(name, { target: { value: '  An  ' } });

    expect(pin.value).toBe('123456');
    expect(name.value).toBe('An');
  });

  it('shows an error for an absent game', async () => {
    get.mockResolvedValue({ exists: () => false });
    render(<PlayerJoin onJoinGame={vi.fn()} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /Tham gia phòng chơi/i }));

    await waitFor(() => expect(screen.getByText(/Không tìm thấy phòng chơi/i)).toBeInTheDocument());
  });

  it('writes a player and calls onJoinGame for a waiting room', async () => {
    const onJoinGame = vi.fn();
    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ status: 'waiting', quiz: { title: 'Quiz' }, players: {} }),
    });
    render(<PlayerJoin onJoinGame={onJoinGame} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /Tham gia phòng chơi/i }));

    await waitFor(() => expect(onJoinGame).toHaveBeenCalledWith('123456', 'player-test', 'An'));
    expect(set).toHaveBeenCalledWith(
      { path: 'games/123456/players/player-test' },
      expect.objectContaining({ name: 'An', score: 0, answers: {} }),
    );
  });

  it('rejects duplicate names and games already started', async () => {
    get.mockResolvedValueOnce({
      exists: () => true,
      val: () => ({ status: 'waiting', players: { old: { name: 'An' } } }),
    });
    render(<PlayerJoin onJoinGame={vi.fn()} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Tham gia phòng chơi/i }));
    await waitFor(() => expect(screen.getByText(/Tên này đã được sử dụng/i)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Nhập tên của bạn'), { target: { value: 'Binh' } });
    get.mockResolvedValueOnce({ exists: () => true, val: () => ({ status: 'question', players: {} }) });
    fireEvent.click(screen.getByRole('button', { name: /Tham gia phòng chơi/i }));
    await waitFor(() => expect(screen.getByText(/Trò chơi đã bắt đầu/i)).toBeInTheDocument());
  });
});
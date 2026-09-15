import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SimpleFlashcard from './Flashcard';

const quiz = {
  title: 'Ôn tập nhanh',
  questions: [
    { question: 'Một cộng một bằng?', options: ['1', '2'], correct: 1, time: 10 },
    { question: 'Màu của lá cây?', options: ['Xanh', 'Đỏ'], correct: 0, time: 10 },
  ],
};

describe('SimpleFlashcard', () => {
  it('shows the first question and hides the answer initially', () => {
    render(<SimpleFlashcard quiz={quiz} />);

    expect(screen.getByText('Một cộng một bằng?')).toBeInTheDocument();
    expect(screen.getByText('Nhấp để xem đáp án')).toBeInTheDocument();
    expect(screen.getByText('Thẻ 1 / 2')).toBeInTheDocument();
    expect(screen.queryByText('2', { selector: 'div' })).not.toBeInTheDocument();
  });

  it('flips the card when clicked', () => {
    render(<SimpleFlashcard quiz={quiz} />);

    fireEvent.click(screen.getByText('Một cộng một bằng?'));

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Nhấp để ẩn đáp án')).toBeInTheDocument();
  });

  it('supports keyboard flip and navigation', () => {
    render(<SimpleFlashcard quiz={quiz} />);

    fireEvent.keyDown(window, { code: 'ArrowRight' });
    expect(screen.getByText('Màu của lá cây?')).toBeInTheDocument();
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByText('Xanh')).toBeInTheDocument();
  });

  it('disables navigation at the first and last cards', () => {
    render(<SimpleFlashcard quiz={quiz} />);
    const previous = screen.getByRole('button', { name: /Trước/i });
    const next = screen.getByRole('button', { name: /Sau/i });

    expect(previous).toBeDisabled();
    fireEvent.click(next);
    expect(next).toBeDisabled();
    expect(previous).not.toBeDisabled();
  });

  it('calls back, restarts and starts a new quiz', () => {
    const onBack = vi.fn();
    const onRestart = vi.fn();
    render(<SimpleFlashcard quiz={quiz} onBack={onBack} onRestart={onRestart} />);

    fireEvent.click(screen.getByRole('button', { name: /Về Dashboard/i }));
    fireEvent.click(screen.getByRole('button', { name: /Quiz mới/i }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onRestart).toHaveBeenCalledOnce();
  });
});
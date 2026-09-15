import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SoloGame from './SoloGame';

const quiz = {
  title: 'Toán cơ bản',
  questions: [
    { question: '2 + 2 = ?', options: ['3', '4'], correct: 1, time: 10 },
    { question: '3 + 3 = ?', options: ['5', '6'], correct: 1, time: 10 },
  ],
};

describe('SoloGame', () => {
  it('renders the first question and options', () => {
    render(<SoloGame quiz={quiz} />);

    expect(screen.getByText('Câu hỏi 1 / 2')).toBeInTheDocument();
    expect(screen.getByText('2 + 2 = ?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4/i })).toBeInTheDocument();
  });

  it('shows a correct result and prevents a second answer', () => {
    render(<SoloGame quiz={quiz} />);
    const correct = screen.getByRole('button', { name: /4/i });
    const wrong = screen.getByRole('button', { name: /3/i });

    fireEvent.click(correct);
    fireEvent.click(wrong);

    expect(screen.getByText('🎉 Chính xác!')).toBeInTheDocument();
    expect(screen.getByText('Điểm hiện tại')).toBeInTheDocument();
    expect(screen.queryByText('❌ Chưa đúng')).not.toBeInTheDocument();
  });

  it('moves to the next question and finishes with a result', () => {
    render(<SoloGame quiz={quiz} />);

    fireEvent.click(screen.getByRole('button', { name: /4/i }));
    fireEvent.click(screen.getByRole('button', { name: /Câu tiếp theo/i }));
    expect(screen.getByText('Câu hỏi 2 / 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /6/i }));
    fireEvent.click(screen.getByRole('button', { name: /Xem kết quả/i }));
    expect(screen.getByText('Hoàn thành học tập!')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('restarts from the result screen', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
    render(<SoloGame quiz={{ ...quiz, questions: [quiz.questions[0]] }} />);

    fireEvent.click(screen.getByRole('button', { name: /4/i }));
    fireEvent.click(screen.getByRole('button', { name: /Xem kết quả/i }));
    fireEvent.click(screen.getByRole('button', { name: /Học lại/i }));

    expect(screen.getByText('Câu hỏi 1 / 1')).toBeInTheDocument();
    now.mockRestore();
  });

  it('renders flashcard mode', () => {
    render(<SoloGame quiz={quiz} isFlashcardMode />);

    expect(screen.getByText('Thẻ 1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Nhấp để xem đáp án')).toBeInTheDocument();
  });
});
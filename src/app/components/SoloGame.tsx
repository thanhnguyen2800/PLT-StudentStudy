'use client';

import { useState, useEffect } from 'react';
import { Quiz } from '../types/game';
import { Trophy, RotateCcw, ArrowRight, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import SimpleFlashcard from './Flashcard';

interface SoloGameProps {
  quiz: Quiz;
  isFlashcardMode?: boolean;
  onRestart?: () => void;
}

interface SoloStats {
  correctAnswers: number;
  totalQuestions: number;
  answers: { [questionIndex: number]: { selected: number; correct: boolean; timeSpent: number } };
  startTime: number;
}

export default function SoloGame({ quiz, isFlashcardMode, onRestart }: SoloGameProps) {
  // If flashcard mode, render SimpleFlashcard component
  if (isFlashcardMode) {
    return <SimpleFlashcard quiz={quiz} onRestart={onRestart} />;
  }

  // Original quiz game logic continues exactly as before
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [stats, setStats] = useState<SoloStats>({
    correctAnswers: 0,
    totalQuestions: quiz.questions.length,
    answers: {},
    startTime: Date.now()
  });
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQ = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  useEffect(() => {
    console.log(`📚 Solo Game - Question ${currentQuestion + 1} of ${quiz.questions.length}`);
    setQuestionStartTime(Date.now());
  }, [currentQuestion, quiz.questions.length]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered

    const isCorrect = answerIndex === currentQ.correct;
    const timeSpent = Date.now() - questionStartTime;

    console.log(`📝 Solo answer: ${isCorrect ? 'Correct' : 'Wrong'} - Selected ${answerIndex}, Correct was ${currentQ.correct}`);

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    // Update stats
    setStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      answers: {
        ...prev.answers,
        [currentQuestion]: {
          selected: answerIndex,
          correct: isCorrect,
          timeSpent
        }
      }
    }));
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      console.log('🏁 Solo game finished');
      setGameFinished(true);
    } else {
      console.log(`➡️ Moving to question ${currentQuestion + 2}`);
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restartQuiz = () => {
    console.log('🔄 Restarting solo quiz');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameFinished(false);
    setStats({
      correctAnswers: 0,
      totalQuestions: quiz.questions.length,
      answers: {},
      startTime: Date.now()
    });
  };

  const getScorePercentage = () => {
    return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
  };

  const getTotalTimeSpent = () => {
    const totalMs = Date.now() - stats.startTime;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreGrade = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return { grade: 'A+', color: '#10b981', emoji: '🏆' };
    if (percentage >= 80) return { grade: 'A', color: '#10b981', emoji: '⭐' };
    if (percentage >= 70) return { grade: 'B', color: '#568EA6', emoji: '👍' };
    if (percentage >= 60) return { grade: 'C', color: '#F18C8E', emoji: '👌' };
    return { grade: 'D', color: '#ef4444', emoji: '📚' };
  };

  if (gameFinished) {
    const scoreGrade = getScoreGrade();

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4F8' }}>
        <div className="w-full max-w-2xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border" style={{ borderColor: '#F0B7A4' }}>
            <div className="text-center">
              <div className="text-6xl mb-4">{scoreGrade.emoji}</div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#305F72' }}>Study Complete!</h1>
              <h2 className="text-xl mb-8 font-medium" style={{ color: '#305F72', opacity: 0.8 }}>{quiz.title}</h2>

              <div className="bg-white p-6 rounded-xl mb-8 border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: scoreGrade.color }}>
                      {getScorePercentage()}%
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.8 }}>Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: scoreGrade.color }}>
                      {scoreGrade.grade}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.8 }}>Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#568EA6' }}>
                      {stats.correctAnswers}/{stats.totalQuestions}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.8 }}>Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#F18C8E' }}>
                      {getTotalTimeSpent()}
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.8 }}>Time</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#305F72' }}>Question Review</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {quiz.questions.map((question, index) => {
                    const answer = stats.answers[index];
                    return (
                      <div key={index} className={`bg-white p-4 rounded-xl border shadow-sm ${answer?.correct ? '' : ''}`} style={{ borderColor: answer?.correct ? '#10b981' : '#ef4444' }}>
                        <div className="flex items-start gap-3">
                          {answer?.correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-sm mb-1" style={{ color: '#305F72' }}>
                              {index + 1}. {question.question}
                            </div>
                            <div className="text-xs font-medium" style={{ color: '#305F72', opacity: 0.8 }}>
                              Your answer: {question.options[answer?.selected || 0]}
                              {!answer?.correct && (
                                <span className="text-green-700 ml-2">
                                  (Correct: {question.options[question.correct]})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={restartQuiz}
                  className="text-white py-4 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  style={{ background: 'linear-gradient(to right, #568EA6, #305F72)' }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Study Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border" style={{ borderColor: '#F0B7A4' }}>
          {/* Progress header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold" style={{ color: '#305F72' }}>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <div className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.8 }}>
                Score: {stats.correctAnswers}/{currentQuestion} correct
              </div>
            </div>

            <div className="rounded-full h-3 mb-2 border" style={{ backgroundColor: '#F0B7A4', borderColor: '#F0B7A4' }}>
              <div
                className="h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: '#568EA6',
                  width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`
                }}
              ></div>
            </div>
            <div className="text-xs font-medium" style={{ color: '#305F72', opacity: 0.6 }}>
              Progress: {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
            </div>
          </div>

          {!showResult ? (
            /* Question phase */
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-tight" style={{ color: '#305F72' }}>
                {currentQ.question}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className="p-5 rounded-xl text-white font-semibold text-left transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: index === 0 ? '#ef4444' :
                        index === 1 ? '#568EA6' :
                          index === 2 ? '#F18C8E' :
                            '#10b981'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1 pr-2">{option}</span>
                      <span className="text-sm opacity-90 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-lg font-mono font-bold">
                        {['A', 'B', 'C', 'D'][index]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-sm font-medium bg-white p-3 rounded-lg border" style={{ color: '#305F72', borderColor: '#F0B7A4' }}>
                💡 Take your time - no pressure in study mode!
              </div>
            </div>
          ) : (
            /* Result phase */
            <div className="text-center">
              <div className={`bg-white p-6 rounded-xl mb-6 border shadow-sm`} style={{ borderColor: stats.answers[currentQuestion]?.correct ? '#10b981' : '#ef4444' }}>
                <div className={`text-3xl font-bold mb-2`} style={{ color: stats.answers[currentQuestion]?.correct ? '#10b981' : '#ef4444' }}>
                  {stats.answers[currentQuestion]?.correct ? '🎉 Correct!' : '❌ Incorrect'}
                </div>

                {!stats.answers[currentQuestion]?.correct && (
                  <div className="mb-3 font-medium" style={{ color: '#305F72' }}>
                    You selected: <span className="font-semibold">{currentQ.options[selectedAnswer!]}</span>
                  </div>
                )}

                <div style={{ color: '#305F72' }}>
                  <span className="font-medium" style={{ opacity: 0.8 }}>Correct answer:</span>{' '}
                  <span className="font-semibold text-green-700">{currentQ.options[currentQ.correct]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: '#568EA6' }}>
                  <div className="text-sm mb-1 font-medium" style={{ color: '#568EA6' }}>Current Score</div>
                  <div className="text-2xl font-bold" style={{ color: '#568EA6' }}>
                    {Math.round((stats.correctAnswers / (currentQuestion + 1)) * 100)}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: '#F18C8E' }}>
                  <div className="text-sm mb-1 font-medium" style={{ color: '#F18C8E' }}>Questions Left</div>
                  <div className="text-2xl font-bold" style={{ color: '#F18C8E' }}>
                    {quiz.questions.length - currentQuestion - 1}
                  </div>
                </div>
              </div>

              <button
                onClick={nextQuestion}
                className="w-full text-white py-4 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ background: 'linear-gradient(to right, #568EA6, #305F72)' }}
              >
                {isLastQuestion ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    View Results
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
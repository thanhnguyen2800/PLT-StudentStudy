'use client';

import { useState, useEffect } from 'react';
import { Quiz } from '../types/game';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface SimpleFlashcardProps {
    quiz: Quiz;
    onRestart?: () => void;
    onBack?: () => void;
}

export default function SimpleFlashcard({ quiz, onRestart, onBack }: SimpleFlashcardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentCard = quiz.questions[currentIndex];
    const isLastCard = currentIndex === quiz.questions.length - 1;
    const isFirstCard = currentIndex === 0;

    // Reset show answer when card changes
    useEffect(() => {
        setShowAnswer(false);
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    setShowAnswer(!showAnswer);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    if (!isFirstCard) {
                        setCurrentIndex(prev => prev - 1);
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (!isLastCard) {
                        setCurrentIndex(prev => prev + 1);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showAnswer, isFirstCard, isLastCard]);

    const nextCard = () => {
        if (!isLastCard) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevCard = () => {
        if (!isFirstCard) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
    };

    return (
        <div className="min-h-screen p-4" style={{ backgroundColor: '#F0F4F8' }}>
            <div className="max-w-2xl mx-auto pt-8">
                {/* Back Button */}
                {onBack && (
                    <div className="flex justify-start mb-6">
                        <button
                            onClick={onBack}
                            className="bg-white/90 hover:bg-white px-4 py-2 rounded-lg transition-all duration-200 border shadow-sm flex items-center gap-2"
                            style={{ color: '#305F72', borderColor: '#F0B7A4' }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2" style={{ color: '#305F72' }}>{quiz.title}</h1>
                    <p style={{ color: '#305F72', opacity: 0.8 }}>
                        Card {currentIndex + 1} of {quiz.questions.length}
                    </p>
                    <div className="mt-4">
                        <div className="rounded-full h-2 w-full" style={{ backgroundColor: '#F0B7A4' }}>
                            <div
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: '#568EA6',
                                    width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <div
                    className="bg-white rounded-2xl shadow-2xl p-8 mb-8 min-h-80 flex flex-col justify-center items-center cursor-pointer border hover:shadow-3xl transition-all duration-200 relative"
                    style={{ borderColor: '#F0B7A4' }}
                    onClick={() => setShowAnswer(!showAnswer)}
                >
                    {!showAnswer ? (
                        // Question side
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-6 leading-tight" style={{ color: '#305F72' }}>
                                {currentCard.question}
                            </div>
                            <div className="text-lg mb-4" style={{ color: '#305F72', opacity: 0.7 }}>
                                Click to reveal answer
                            </div>
                            <div className="text-sm" style={{ color: '#305F72', opacity: 0.5 }}>
                                Press Space to flip • Arrow keys to navigate
                            </div>
                            <div className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#568EA6' }}>
                                QUESTION
                            </div>
                        </div>
                    ) : (
                        // Answer side
                        <div className="text-center">
                            <div className="text-lg mb-4 font-medium" style={{ color: '#305F72', opacity: 0.8 }}>
                                {currentCard.question}
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold mb-6 leading-tight text-green-700">
                                {currentCard.options[currentCard.correct]}
                            </div>
                            <div className="text-sm" style={{ color: '#305F72', opacity: 0.7 }}>
                                Click to hide answer
                            </div>
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                ANSWER
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={prevCard}
                        disabled={isFirstCard}
                        className="flex items-center gap-2 px-4 py-3 text-white rounded-lg transition-all font-medium disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: isFirstCard ? '#9ca3af' : '#F0B7A4',
                            color: isFirstCard ? '#ffffff' : '#305F72'
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={restart}
                            className="px-4 py-3 text-white rounded-lg transition-all font-medium flex items-center gap-2"
                            style={{ backgroundColor: '#568EA6' }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restart
                        </button>

                        {onRestart && (
                            <button
                                onClick={onRestart}
                                className="px-4 py-3 text-white rounded-lg transition-all font-medium"
                                style={{ backgroundColor: '#F18C8E' }}
                            >
                                New Quiz
                            </button>
                        )}
                    </div>

                    <button
                        onClick={nextCard}
                        disabled={isLastCard}
                        className="flex items-center gap-2 px-4 py-3 text-white rounded-lg transition-all font-medium disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: isLastCard ? '#9ca3af' : '#568EA6'
                        }}
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Keyboard shortcuts help */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-4 text-xs bg-white/80 px-4 py-2 rounded-lg border" style={{ color: '#305F72', borderColor: '#F0B7A4' }}>
                        <span><kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}>Space</kbd> Flip</span>
                        <span><kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}>←</kbd> Previous</span>
                        <span><kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}>→</kbd> Next</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
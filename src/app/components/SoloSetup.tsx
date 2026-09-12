'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Play, FileText, Copy, RefreshCw, BookOpen, Brain, ArrowLeft } from 'lucide-react';
import { Quiz } from '../types/game';
import { validateQuiz, sampleQuiz } from '../utils/gameUtils';

interface SoloSetupProps {
  onStartSolo: (quiz: Quiz, isFlashcardMode?: boolean) => void;
  preloadedQuiz?: Quiz | null;
  onBack?: () => void;
}

export default function SoloSetup({ onStartSolo, preloadedQuiz, onBack }: SoloSetupProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(preloadedQuiz || null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState('');
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle preloaded quiz
  useEffect(() => {
    if (preloadedQuiz) {
      setQuiz(preloadedQuiz);
      setJsonText(JSON.stringify(preloadedQuiz, null, 2));
      setError('');
      console.log('📚 Preloaded quiz:', preloadedQuiz.title);
    }
  }, [preloadedQuiz]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 File selected for solo study:', file?.name, `(${file?.size} bytes)`);

    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            throw new Error('Failed to read file content');
          }

          const jsonData = JSON.parse(result);
          console.log('✅ JSON parsed successfully for solo study');
          console.log(`📊 Quiz data: "${jsonData.title}" with ${jsonData.questions?.length || 0} questions`);

          validateQuiz(jsonData);
          setQuiz(jsonData);
          setJsonText(JSON.stringify(jsonData, null, 2));
          setError('');
          console.log('✅ Quiz validation passed for solo study');
        } catch (error) {
          console.error('❌ JSON parsing/validation error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setError(`Invalid JSON file: ${errorMessage}`);
          setQuiz(null);
        }
      };

      reader.onerror = () => {
        console.error('❌ File reading error');
        setError('Error reading file. Please try again.');
      };

      reader.readAsText(file);
    } else {
      console.warn('⚠️ Invalid file type selected:', file?.type);
      setError('Please select a valid JSON file');
    }
  };

  const handleJsonPaste = () => {
    if (!jsonText.trim()) {
      setError('Please paste some JSON content');
      return;
    }

    try {
      const jsonData = JSON.parse(jsonText.trim());
      console.log('✅ Pasted JSON parsed successfully');
      console.log(`📊 Quiz data: "${jsonData.title}" with ${jsonData.questions?.length || 0} questions`);

      validateQuiz(jsonData);
      setQuiz(jsonData);
      setError('');
      console.log('✅ Quiz validation passed for pasted content');
    } catch (error) {
      console.error('❌ JSON parsing/validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Invalid JSON: ${errorMessage}`);
      setQuiz(null);
    }
  };

  const loadSampleQuiz = () => {
    console.log('📝 Loading sample quiz for solo study');
    console.log(`📊 Sample quiz: "${sampleQuiz.title}" with ${sampleQuiz.questions.length} questions`);
    setQuiz(sampleQuiz);
    setJsonText(JSON.stringify(sampleQuiz, null, 2));
    setError('');
  };

  const clearJson = () => {
    setJsonText('');
    setQuiz(null);
    setError('');
    console.log('🧹 Cleared JSON text and quiz');
  };

  const startSoloGame = () => {
    if (!quiz) {
      console.warn('⚠️ Attempted to start solo game without quiz');
      return;
    }

    console.log(`📚 Starting solo study game in ${isFlashcardMode ? 'flashcard' : 'quiz'} mode`);
    console.log(`📝 Quiz: "${quiz.title}" (${quiz.questions.length} questions)`);
    onStartSolo(quiz, isFlashcardMode);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-20" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border" style={{ borderColor: '#F0B7A4' }}>
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-white/90 hover:bg-white px-4 py-2 rounded-lg transition-all duration-200 border shadow-sm flex items-center gap-2"
                  style={{ color: '#305F72', borderColor: '#F0B7A4' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#305F72' }}>
                  <BookOpen style={{ color: '#568EA6' }} />
                  Solo Study Mode
                </h1>
                <p style={{ color: '#305F72', opacity: 0.8 }}>Practice with your own quizzes at your own pace</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Show preloaded quiz notification */}
          {preloadedQuiz && quiz && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
              <strong>Quiz Loaded:</strong> "{quiz.title}" is ready for study!
            </div>
          )}

          <div className={`${quiz ? 'max-w-2xl mx-auto' : 'grid lg:grid-cols-2 gap-8'}`}>
            {/* Left side - Quiz input (only show if no preloaded quiz) */}
            {!preloadedQuiz && (
              <div className="space-y-6">
                {/* Tab selector */}
                <div className="flex space-x-1 bg-white/70 p-1 rounded-lg border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'text-white shadow-lg' : 'hover:bg-white/70'
                      }`}
                    style={activeTab === 'upload' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button
                    onClick={() => setActiveTab('paste')}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'paste' ? 'text-white shadow-lg' : 'hover:bg-white/70'
                      }`}
                    style={activeTab === 'paste' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
                  >
                    <FileText className="w-4 h-4" />
                    Paste JSON
                  </button>
                </div>

                {/* Upload tab */}
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        console.log('📁 Opening file picker for solo quiz upload');
                        fileInputRef.current?.click();
                      }}
                      className="w-full p-8 border-2 border-dashed rounded-xl hover:border-opacity-80 transition-all duration-200 hover:shadow-sm group bg-white"
                      style={{
                        borderColor: '#F0B7A4'
                      }}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ color: '#568EA6' }} />
                      <span className="font-medium text-lg block mb-2" style={{ color: '#568EA6' }}>
                        Upload Quiz JSON File
                      </span>
                      <span className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Click to browse or drag and drop</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Paste tab */}
                {activeTab === 'paste' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder="Paste your quiz JSON here..."
                        className="w-full h-48 bg-white border rounded-lg p-4 font-mono text-sm resize-none outline-none transition-colors focus:border-blue-500"
                        style={{
                          color: '#305F72',
                          borderColor: '#F0B7A4'
                        }}
                      />
                      {jsonText && (
                        <button
                          onClick={clearJson}
                          className="absolute top-2 right-2 p-2 rounded transition-colors"
                          style={{
                            backgroundColor: '#F0B7A4',
                            color: '#305F72'
                          }}
                          title="Clear JSON"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleJsonPaste}
                        disabled={!jsonText.trim()}
                        className="flex-1 text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        style={{ backgroundColor: !jsonText.trim() ? '#9ca3af' : '#568EA6' }}
                      >
                        <Copy className="w-4 h-4" />
                        Parse JSON
                      </button>
                      <button
                        onClick={clearJson}
                        disabled={!jsonText}
                        className="py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: !jsonText ? '#e5e7eb' : '#F0B7A4',
                          color: '#305F72'
                        }}
                        title="Clear"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sample quiz button */}
                <div className="pt-4 border-t" style={{ borderColor: '#F0B7A4' }}>
                  <button
                    onClick={loadSampleQuiz}
                    className="w-full text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold"
                    style={{ backgroundColor: '#F18C8E' }}
                  >
                    📝 Load Sample Quiz
                  </button>
                </div>

                {/* JSON format help */}
                <div className="bg-white p-4 rounded-lg border" style={{ borderColor: '#F0B7A4' }}>
                  <h3 className="font-semibold mb-2" style={{ color: '#305F72' }}>Expected JSON Format:</h3>
                  <pre className="text-xs bg-white p-3 rounded overflow-x-auto border" style={{ color: '#305F72', borderColor: '#F0B7A4' }}>
                    {JSON.stringify({
                      title: "Quiz Title",
                      questions: [{
                        question: "Your question?",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correct: 2,
                        time: 20
                      }]
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Quiz preview and start section */}
            <div className="space-y-6">
              {quiz ? (
                <>
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
                    <h3 className="font-semibold text-xl mb-3" style={{ color: '#305F72' }}>{quiz.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-white px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#568EA6' }}>
                        {quiz.questions?.length} questions
                      </span>
                      <span className="text-sm flex items-center gap-2" style={{ color: '#305F72', opacity: 0.8 }}>
                        {isFlashcardMode ? (
                          <>
                            <BookOpen className="w-4 h-4" />
                            Flashcard Mode
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Quiz Mode
                          </>
                        )}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium" style={{ color: '#305F72' }}>
                        {isFlashcardMode ? 'Flashcard Preview:' : 'Question Preview:'}
                      </h4>
                      {quiz.questions?.slice(0, 3).map((q, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border-l-4 border" style={{ borderLeftColor: '#568EA6', borderColor: '#F0B7A4' }}>
                          <div className="font-medium text-sm mb-2" style={{ color: '#305F72' }}>
                            {i + 1}. {q.question}
                          </div>
                          <div className="text-xs" style={{ color: '#305F72', opacity: 0.8 }}>
                            {isFlashcardMode
                              ? `Answer: ${q.options[q.correct]}`
                              : `${q.options.length} options • ${q.time}s timer`
                            }
                          </div>
                        </div>
                      ))}

                      {quiz.questions && quiz.questions.length > 3 && (
                        <div className="text-xs text-center" style={{ color: '#305F72', opacity: 0.6 }}>
                          ... and {quiz.questions.length - 3} more {isFlashcardMode ? 'flashcards' : 'questions'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mode Selection Toggle */}
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
                    <h3 className="font-semibold text-center mb-4" style={{ color: '#305F72' }}>Choose Your Study Mode</h3>
                    <div className="flex space-x-1 bg-white p-1 rounded-lg mb-4 border" style={{ borderColor: '#F0B7A4' }}>
                      <button
                        onClick={() => setIsFlashcardMode(false)}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${!isFlashcardMode ? 'text-white shadow-lg' : 'hover:bg-gray-50'
                          }`}
                        style={!isFlashcardMode ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
                      >
                        <Brain className="w-4 h-4" />
                        Quiz Mode
                      </button>
                      <button
                        onClick={() => setIsFlashcardMode(true)}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isFlashcardMode ? 'text-white shadow-lg' : 'hover:bg-gray-50'
                          }`}
                        style={isFlashcardMode ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
                      >
                        <BookOpen className="w-4 h-4" />
                        Flashcard Mode
                      </button>
                    </div>

                    <ul className="space-y-2 text-sm" style={{ color: '#305F72' }}>
                      {isFlashcardMode ? (
                        <>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Click to flip and reveal answers
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Navigate at your own pace
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Perfect for memorization
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            No time pressure - take your time
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Instant feedback on answers
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Track your progress
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={startSoloGame}
                    className="w-full text-white py-4 px-6 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    style={{
                      background: 'linear-gradient(to right, #568EA6, #305F72)',
                      borderColor: '#568EA6'
                    }}
                  >
                    {isFlashcardMode ? <BookOpen className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                    Start {isFlashcardMode ? 'Flashcards' : 'Quiz'}
                  </button>
                </>
              ) : (
                <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#305F72' }}>Ready to Study?</h3>
                  <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>Upload a quiz file, paste JSON content, or try the sample quiz to get started.</p>
                  <div className="text-sm" style={{ color: '#305F72', opacity: 0.6 }}>
                    Perfect for exam prep, learning new topics, or testing your knowledge
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
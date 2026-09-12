'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Play, FileText, Copy } from 'lucide-react';
import { Quiz, Game } from '../types/game';
import { generateGamePin, validateQuiz, sampleQuiz } from '../utils/gameUtils';
import { gameCleanupManager } from '../utils/gameCleanup';
import { ref, set } from 'firebase/database';
import { database } from '../lib/firebase';

interface HostDashboardProps {
  onStartGame: (pin: string, quiz: Quiz) => void;
  preloadedQuiz?: Quiz | null;
  onBack?: () => void;
}

export default function HostDashboard({ onStartGame, preloadedQuiz, onBack }: HostDashboardProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize cleanup system when component mounts
  useEffect(() => {
    console.log('🔧 Initializing game cleanup system');

    // Start periodic cleanup every 5 minutes
    gameCleanupManager.startPeriodicCleanup(5);

    // Cleanup when component unmounts
    return () => {
      gameCleanupManager.cleanup();
    };
  }, []);

  // Handle pre-loaded quiz
  useEffect(() => {
    if (preloadedQuiz) {
      console.log('📝 Pre-loaded quiz detected:', preloadedQuiz.title);
      console.log(`📊 Quiz has ${preloadedQuiz.questions?.length || 0} questions`);

      try {
        validateQuiz(preloadedQuiz);
        setQuiz(preloadedQuiz);
        setJsonText(JSON.stringify(preloadedQuiz, null, 2));
        setError('');
        console.log('✅ Pre-loaded quiz validation passed');
      } catch (error) {
        console.error('❌ Pre-loaded quiz validation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Invalid pre-loaded quiz: ${errorMessage}`);
        setQuiz(null);
      }
    }
  }, [preloadedQuiz]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 File selected for upload:', file?.name, `(${file?.size} bytes)`);

    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            throw new Error('Failed to read file content');
          }

          const jsonData = JSON.parse(result);
          console.log('✅ JSON parsed successfully');
          console.log(`📊 Quiz data: "${jsonData.title}" with ${jsonData.questions?.length || 0} questions`);

          validateQuiz(jsonData);
          setQuiz(jsonData);
          setJsonText(JSON.stringify(jsonData, null, 2));
          setError('');
          console.log('✅ Quiz validation passed');
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

  const createGame = async () => {
    if (!quiz) {
      console.warn('⚠️ Attempted to create game without quiz');
      return;
    }

    setLoading(true);
    try {
      const pin = generateGamePin();
      const now = Date.now();

      console.log('🎮 Creating game...');
      console.log(`🔢 Generated PIN: ${pin}`);
      console.log(`📝 Quiz: "${quiz.title}" (${quiz.questions.length} questions)`);

      // Create game data structure with cleanup tracking
      const gameData: Game = {
        quiz,
        status: 'waiting',
        players: {},
        currentQuestion: -1,
        createdAt: now,
        lastActivity: now,
        host: 'host_' + now
      };

      console.log('🔥 Saving game to Firebase...');

      // Save to Firebase
      const gameRef = ref(database, `games/${pin}`);
      await set(gameRef, gameData);

      console.log('✅ Game created successfully in Firebase');
      console.log(`🌐 Game saved with PIN: ${pin}`);

      // Schedule automatic cleanup for this game
      gameCleanupManager.scheduleCleanup(pin, 'waiting');

      console.log('🚀 Starting host game interface');
      onStartGame(pin, quiz);
    } catch (error) {
      console.error('❌ Error creating game:', error);
      const firebaseError = error as { code?: string; message?: string };
      setError(
        firebaseError.code
          ? `Failed to create game (${firebaseError.code}). ${firebaseError.message || 'Please check Firebase Database Rules.'}`
          : 'Failed to create game. Please check Firebase Database Rules and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuiz = () => {
    console.log('📝 Loading sample quiz');
    console.log(`📊 Sample quiz: "${sampleQuiz.title}" with ${sampleQuiz.questions.length} questions`);
    setQuiz(sampleQuiz);
    setJsonText(JSON.stringify(sampleQuiz, null, 2));
    setError('');
  };

  const clearQuiz = () => {
    console.log('🗑️ Clearing current quiz');
    setQuiz(null);
    setJsonText('');
    setError('');
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-20" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border" style={{ borderColor: '#F0B7A4' }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#305F72' }}>
              Host Dashboard
            </h1>
            {onBack && (
              <button
                onClick={onBack}
                className="bg-white/90 hover:bg-white px-4 py-2 rounded-lg transition-all duration-200 border shadow-sm"
                style={{ color: '#305F72', borderColor: '#F0B7A4' }}
              >
                ← Back
              </button>
            )}
          </div>

          {/* Pre-loaded Quiz Banner */}
          {preloadedQuiz && quiz && (
            <div className="bg-green-50/90 backdrop-blur-sm border border-green-200/50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <strong className="font-semibold">Quiz Loaded:</strong> "{quiz.title}" with {quiz.questions.length} questions
              </div>
              <button
                onClick={clearQuiz}
                className="text-green-600 hover:text-green-800 font-medium text-sm"
              >
                Clear & Upload Different
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Auto-cleanup info banner */}
          <div className="bg-white px-4 py-3 rounded-xl mb-6 shadow-sm border" style={{ borderColor: '#568EA6' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#568EA6' }}></div>
              <span className="text-sm font-medium" style={{ color: '#305F72' }}>
                <strong>Auto-Cleanup Active:</strong> Games will be automatically deleted after inactivity periods (10min waiting, 30min during game, 5min after completion)
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#305F72' }}>Setup Quiz</h2>

                {/* Only show upload options if no pre-loaded quiz or user cleared it */}
                {!quiz && (
                  <>
                    {/* Tab selector */}
                    <div className="flex bg-white rounded-xl p-1 mb-4 shadow-inner border" style={{ borderColor: '#F0B7A4' }}>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'text-white shadow-lg' : 'hover:bg-gray-50'
                          }`}
                        style={activeTab === 'upload' ? { background: 'linear-gradient(to right, #568EA6, #305F72)' } : { color: '#305F72' }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </button>
                      <button
                        onClick={() => setActiveTab('paste')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'paste' ? 'text-white shadow-lg' : 'hover:bg-gray-50'
                          }`}
                        style={activeTab === 'paste' ? { background: 'linear-gradient(to right, #568EA6, #305F72)' } : { color: '#305F72' }}
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
                            console.log('📁 Opening file picker for quiz upload');
                            fileInputRef.current?.click();
                          }}
                          className="w-full p-6 border-2 border-dashed rounded-xl hover:border-opacity-80 transition-all duration-200 bg-white hover:shadow-sm group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          style={{ borderColor: '#F0B7A4' }}
                        >
                          <Upload className="w-10 h-10 mx-auto mb-3 group-hover:opacity-80 transition-colors" style={{ color: '#568EA6' }} />
                          <span className="font-semibold block mb-2" style={{ color: '#568EA6' }}>Upload JSON Quiz File</span>
                          <span className="text-sm" style={{ color: '#305F72', opacity: 0.7 }}>Click to browse or drag and drop</span>
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
                        <textarea
                          value={jsonText}
                          onChange={(e) => setJsonText(e.target.value)}
                          placeholder="Paste your quiz JSON here..."
                          className="w-full h-48 bg-white border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm focus:ring-blue-500"
                          style={{
                            color: '#305F72',
                            borderColor: '#F0B7A4'
                          }}
                        />
                        <button
                          onClick={handleJsonPaste}
                          className="w-full text-white py-3 px-6 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          style={{
                            background: 'linear-gradient(to right, #568EA6, #305F72)'
                          }}
                        >
                          <Copy className="w-4 h-4" />
                          Parse JSON
                        </button>
                      </div>
                    )}

                    {/* Sample quiz button */}
                    <div className="pt-4 border-t" style={{ borderColor: '#F0B7A4' }}>
                      <button
                        onClick={() => {
                          console.log('📝 User clicked "Load Sample Quiz"');
                          loadSampleQuiz();
                        }}
                        className="w-full text-white py-3 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        style={{
                          backgroundColor: '#F18C8E'
                        }}
                      >
                        📝 Load Sample Quiz
                      </button>
                    </div>
                  </>
                )}

                {/* Show loaded quiz info */}
                {quiz && (
                  <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: '#10b981' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-green-800">✅ Quiz Ready</h3>
                      {!preloadedQuiz && (
                        <button
                          onClick={clearQuiz}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Clear Quiz
                        </button>
                      )}
                    </div>
                    <div className="text-green-700">
                      <div className="font-semibold text-lg mb-1">{quiz.title}</div>
                      <div className="text-sm">{quiz.questions.length} questions • Ready to host</div>
                    </div>
                  </div>
                )}

                {/* JSON format help - only show if no quiz loaded */}
                {!quiz && (
                  <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                    <h3 className="font-semibold mb-2" style={{ color: '#305F72' }}>Expected JSON Format:</h3>
                    <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto border" style={{ color: '#305F72', borderColor: '#F0B7A4' }}>
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
                )}
              </div>
            </div>

            <div className="space-y-6">
              {quiz ? (
                <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                  <h3 className="font-semibold text-xl mb-2" style={{ color: '#305F72' }}>{quiz.title}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg" style={{ background: 'linear-gradient(to right, #568EA6, #305F72)' }}>
                      {quiz.questions?.length} questions
                    </span>
                    <span className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.8 }}>
                      Multiplayer Game
                    </span>
                    {preloadedQuiz && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Pre-loaded
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold" style={{ color: '#305F72' }}>Question Preview:</h4>
                    {quiz.questions?.slice(0, 3).map((q, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border-l-4 border shadow-sm" style={{ borderLeftColor: '#568EA6', borderColor: '#F0B7A4' }}>
                        <div className="font-semibold text-sm mb-2" style={{ color: '#305F72' }}>
                          {i + 1}. {q.question}
                        </div>
                        <div className="text-xs font-medium" style={{ color: '#305F72', opacity: 0.8 }}>
                          {q.options.length} options • {q.time}s timer
                        </div>
                      </div>
                    ))}

                    {quiz.questions && quiz.questions.length > 3 && (
                      <div className="text-xs text-center font-medium" style={{ color: '#305F72', opacity: 0.6 }}>
                        ... and {quiz.questions.length - 3} more questions
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center bg-white p-8 rounded-xl border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#305F72' }}>Ready to Host?</h3>
                  <p className="mb-4 font-medium" style={{ color: '#305F72', opacity: 0.8 }}>Upload a quiz file, paste JSON content, or try the sample quiz to get started.</p>
                  <div className="text-sm font-medium" style={{ color: '#305F72', opacity: 0.6 }}>
                    Create a game PIN and manage players in real-time
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  console.log('🚀 User clicked "Create Game"');
                  createGame();
                }}
                disabled={!quiz || loading}
                className="w-full text-white py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed focus:ring-blue-500"
                style={{
                  background: (!quiz || loading) ? '#9ca3af' : 'linear-gradient(to right, #568EA6, #305F72)'
                }}
              >
                <Play className="w-5 h-5" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Game...
                  </>
                ) : (
                  'Create Game'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
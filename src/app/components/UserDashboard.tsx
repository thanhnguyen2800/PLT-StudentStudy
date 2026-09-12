'use client';

import { useState, useEffect } from 'react';
import { FaPlay, FaUsers, FaBook, FaChartLine, FaEdit, FaTrash, FaPlus, FaStar, FaGamepad, FaUserPlus, FaSave, FaUpload } from 'react-icons/fa';
import { useAuth } from './AuthProvider';
import { QuizStorageService, StoredQuiz } from '../lib/quizStorage';
import { Quiz } from '../types/game';
import { Prompts } from './prompts';

interface UserDashboardProps {
  onBack: () => void;
  onPlayQuiz: (quiz: Quiz, mode: 'host' | 'solo') => void;
  onHostGame: (quiz?: Quiz) => void;
  onJoinGame: () => void;
  onSoloSetup: (quiz?: Quiz) => void;
  showToastMessage: (message: string) => void;
}

interface QuizEditorState {
  title: string;
  questions: {
    question: string;
    options: string[];
    correct: number;
    time: number;
  }[];
}

export function UserDashboard({ onBack, onPlayQuiz, onHostGame, onJoinGame, onSoloSetup, showToastMessage }: UserDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'library' | 'prompts'>('overview');
  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Quiz Editor State
  const [editingQuiz, setEditingQuiz] = useState<StoredQuiz | null>(null);
  const [quiz, setQuiz] = useState<QuizEditorState>({ title: '', questions: [] });
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [editorMode, setEditorMode] = useState<'manual' | 'paste'>('paste');

  useEffect(() => {
    if (user) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userQuizzes = await QuizStorageService.getUserQuizzes(user);
      setQuizzes(userQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    setQuiz({ title: '', questions: [] });
    setEditingQuiz(null);
    setTags('');
    setPasteText('');
    setEditorMode('paste');
  };

  const handlePasteQuiz = () => {
    try {
      const parsedQuiz = JSON.parse(pasteText);

      if (!parsedQuiz.title || !Array.isArray(parsedQuiz.questions)) {
        throw new Error('Invalid quiz format');
      }

      parsedQuiz.questions.forEach((q: any, index: number) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1} has invalid format`);
        }
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
          throw new Error(`Question ${index + 1} has invalid correct answer index`);
        }
        if (!q.time || q.time < 5 || q.time > 300) {
          q.time = 20;
        }
      });

      setQuiz(parsedQuiz);
      setEditorMode('manual');
      setPasteText('');
      showToastMessage('Quiz imported successfully!');
    } catch (error) {
      showToastMessage('Invalid JSON format. Please check your quiz structure.');
      console.error('Parse error:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      time: 20
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, updates: Partial<typeof quiz.questions[0]>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const deleteQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const saveQuiz = async () => {
    if (!user || !quiz.title.trim() || quiz.questions.length === 0) {
      showToastMessage('Please add a title and at least one question');
      return;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question.trim()) {
        showToastMessage(`Question ${i + 1} is missing question text`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        showToastMessage(`Question ${i + 1} has empty options`);
        return;
      }
    }

    setSaving(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      if (editingQuiz) {
        await QuizStorageService.updateQuiz(editingQuiz.id, {
          ...quiz,
          tags: tagsArray
        });
        showToastMessage('Quiz updated successfully!');
      } else {
        await QuizStorageService.saveQuiz(user, quiz, false, tagsArray);
        showToastMessage('Quiz saved successfully!');
      }

      resetEditor();
      await loadQuizzes();
      setActiveTab('library');
    } catch (error) {
      showToastMessage('Failed to save quiz. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const editQuiz = (quiz: StoredQuiz) => {
    setEditingQuiz(quiz);
    setQuiz({
      title: quiz.title,
      questions: [...quiz.questions]
    });
    setTags(quiz.tags?.join(', ') || '');
    setEditorMode('manual');
    setActiveTab('create');
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      await QuizStorageService.deleteQuiz(quizId);
      await loadQuizzes();
      setShowDeleteConfirm(null);
      showToastMessage('Quiz deleted successfully');
    } catch (error) {
      showToastMessage('Failed to delete quiz. Please try again.');
      console.error('Delete quiz error:', error);
    }
  };

  const hostRealGame = async (storedQuiz: StoredQuiz) => {
    try {
      console.log(`🎮 Starting real hosting for quiz: "${storedQuiz.title}"`);

      await QuizStorageService.incrementPlayCount(storedQuiz.id);

      const gameQuiz: Quiz = {
        title: storedQuiz.title,
        questions: storedQuiz.questions
      };

      onHostGame(gameQuiz);

      showToastMessage(`Starting hosting for "${storedQuiz.title}"`);
    } catch (error) {
      console.error('Error starting real hosting:', error);
      showToastMessage('Failed to start hosting. Please try again.');
    }
  };

  const playSolo = async (storedQuiz: StoredQuiz) => {
    try {
      console.log(`📚 Going to solo setup for quiz: "${storedQuiz.title}"`);

      const gameQuiz: Quiz = {
        title: storedQuiz.title,
        questions: storedQuiz.questions
      };

      onSoloSetup(gameQuiz);

      showToastMessage(`Setting up solo study for "${storedQuiz.title}"`);
    } catch (error) {
      console.error('Error setting up solo study:', error);
      showToastMessage('Failed to setup solo study. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4F8' }}>
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl border shadow-xl" style={{ borderColor: '#F0B7A4' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Please Sign In</h2>
          <p className="mb-6" style={{ color: '#305F72', opacity: 0.7 }}>You need to sign in to access your dashboard.</p>
          <button
            onClick={onBack}
            className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{ backgroundColor: '#568EA6' }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-20" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: '#305F72' }}>
              <FaChartLine style={{ color: '#568EA6' }} />
              My Dashboard
            </h1>
            <p style={{ color: '#305F72', opacity: 0.7 }}>
              Manage your quizzes, host games, and track your progress
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-white/90 hover:bg-white px-6 py-3 rounded-lg transition-all duration-200 border shadow-sm"
            style={{ color: '#305F72', borderColor: '#F0B7A4' }}
          >
            ← Back
          </button>
        </div>

        {/* Game Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => onHostGame()}
            className="text-white p-6 rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #568EA6, #305F72)' }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaUsers className="text-2xl" />
              <span>Host a Game</span>
            </div>
            <p className="text-white/80 text-sm">Create a room and invite others to join your quiz</p>
          </button>

          <button
            onClick={onJoinGame}
            className="text-white p-6 rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #F18C8E, #305F72)' }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaUserPlus className="text-2xl" />
              <span>Join a Game</span>
            </div>
            <p className="text-white/80 text-sm">Enter a game PIN to join someone else's quiz</p>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/70 p-1 rounded-lg mb-8 border shadow-sm overflow-x-auto" style={{ borderColor: '#F0B7A4' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'text-white shadow-lg' : 'hover:bg-white/70'
              }`}
            style={activeTab === 'overview' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
          >
            <FaChartLine />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'library' ? 'text-white shadow-lg' : 'hover:bg-white/70'
              }`}
            style={activeTab === 'library' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
          >
            <FaBook />
            My Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'prompts' ? 'text-white shadow-lg' : 'hover:bg-white/70'
              }`}
            style={activeTab === 'prompts' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
          >
            <FaUpload />
            AI Prompts
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              resetEditor();
            }}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'create' ? 'text-white shadow-lg' : 'hover:bg-white/70'
              }`}
            style={activeTab === 'create' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
          >
            <FaPlus />
            Create Quiz
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#568EA6' }}>
                  <FaBook className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#305F72' }}>Total Quizzes</h3>
                  <p className="text-sm" style={{ color: '#305F72', opacity: 0.7 }}>Your creations</p>
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#305F72' }}>{quizzes.length}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F18C8E' }}>
                  <FaGamepad className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#305F72' }}>Total Plays</h3>
                  <p className="text-sm" style={{ color: '#305F72', opacity: 0.7 }}>Across all quizzes</p>
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#305F72' }}>
                {quizzes.reduce((sum, quiz) => sum + (quiz.timesPlayed || 0), 0)}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0B7A4' }}>
                  <FaStar style={{ color: '#305F72' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#305F72' }}>Favorite Quizzes</h3>
                  <p className="text-sm" style={{ color: '#305F72', opacity: 0.7 }}>Most played</p>
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#305F72' }}>
                {quizzes.filter(q => q.timesPlayed > 5).length}
              </p>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 lg:col-span-3 bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#305F72' }}>Recent Quizzes</h3>
              {quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <FaBook className="text-4xl mx-auto mb-4" style={{ color: '#F0B7A4' }} />
                  <p style={{ color: '#305F72', opacity: 0.7 }}>No quizzes yet. Create your first quiz to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.slice(0, 5).map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                      <div className="flex-1">
                        <h4 className="font-medium" style={{ color: '#305F72' }}>{quiz.title}</h4>
                        <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>
                          {quiz.questions.length} questions • {quiz.timesPlayed} plays
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playSolo(quiz)}
                          className="text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                          style={{ backgroundColor: '#F0B7A4' }}
                          title="Practice solo"
                        >
                          <FaBook className="w-3 h-3" style={{ color: '#305F72' }} />
                          <span style={{ color: '#305F72' }}>Study</span>
                        </button>
                        <button
                          onClick={() => hostRealGame(quiz)}
                          className="text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                          style={{ backgroundColor: '#568EA6' }}
                          title="Host multiplayer game"
                        >
                          <FaUsers className="w-3 h-3" />
                          Host
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <Prompts showToastMessage={showToastMessage} />
        )}

        {activeTab === 'library' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#F0B7A4', borderTopColor: '#568EA6' }}></div>
                <span className="ml-3" style={{ color: '#305F72', opacity: 0.7 }}>Loading quizzes...</span>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12">
                <FaBook className="text-6xl mx-auto mb-4" style={{ color: '#F0B7A4' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#305F72' }}>No quizzes yet</h3>
                <p className="mb-6" style={{ color: '#305F72', opacity: 0.7 }}>Create your first quiz to get started!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
                  style={{ backgroundColor: '#568EA6' }}
                >
                  <FaPlus />
                  Create Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-white/80 backdrop-blur-sm border rounded-xl p-6 hover:shadow-xl transition-all duration-300 shadow-lg" style={{ borderColor: '#F0B7A4' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#305F72' }}>{quiz.title}</h3>
                        <div className="flex items-center gap-4 text-sm" style={{ color: '#305F72', opacity: 0.7 }}>
                          <span className="flex items-center gap-1">
                            <FaBook className="w-3 h-3" />
                            {quiz.questions.length} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <FaPlay className="w-3 h-3" />
                            {quiz.timesPlayed} plays
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => editQuiz(quiz)}
                          className="p-2 transition-colors"
                          style={{ color: '#305F72', opacity: 0.5 }}
                          title="Edit quiz"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(quiz.id)}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                          title="Delete quiz"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {quiz.tags && quiz.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quiz.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs" style={{ color: '#305F72', opacity: 0.5 }}>
                        <span className="px-2 py-1 rounded" style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}>
                          Private
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => playSolo(quiz)}
                          className="text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1"
                          style={{ backgroundColor: '#F0B7A4' }}
                          title="Practice solo"
                        >
                          <FaBook className="w-3 h-3" style={{ color: '#305F72' }} />
                          <span style={{ color: '#305F72' }}>Study</span>
                        </button>
                        <button
                          onClick={() => hostRealGame(quiz)}
                          className="text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1"
                          style={{ backgroundColor: '#568EA6' }}
                          title="Host real multiplayer game"
                        >
                          <FaUsers className="w-3 h-3" />
                          Host
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border shadow-lg" style={{ borderColor: '#F0B7A4' }}>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: '#305F72' }}>
                {editingQuiz ? <FaEdit /> : <FaPlus />}
                {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>

              {/* Editor Mode Toggle */}
              <div className="flex space-x-1 bg-white p-1 rounded-lg mb-6 border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                <button
                  onClick={() => setEditorMode('paste')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${editorMode === 'paste' ? 'text-white shadow-lg' : 'hover:bg-gray-50'
                    }`}
                  style={editorMode === 'paste' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
                >
                  <FaUpload />
                  Paste JSON
                </button>
                <button
                  onClick={() => setEditorMode('manual')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${editorMode === 'manual' ? 'text-white shadow-lg' : 'hover:bg-gray-50'
                    }`}
                  style={editorMode === 'manual' ? { backgroundColor: '#568EA6' } : { color: '#305F72' }}
                >
                  <FaEdit />
                  Manual Editor
                </button>
              </div>

              {/* Paste JSON Mode */}
              {editorMode === 'paste' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4" style={{ color: '#305F72' }}>Paste Quiz JSON</h3>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      className="w-full h-64 bg-white border rounded-lg px-4 py-3 font-mono text-sm resize-none outline-none transition-colors focus:border-blue-500"
                      style={{
                        color: '#305F72',
                        borderColor: '#F0B7A4'
                      }}
                      placeholder={`Paste your quiz JSON here, for example:

{
  "title": "Sample Quiz",
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correct": 2,
      "time": 20
    }
  ]
}`}
                    />
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={handlePasteQuiz}
                        disabled={!pasteText.trim()}
                        className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ backgroundColor: !pasteText.trim() ? '#9ca3af' : '#568EA6' }}
                      >
                        <FaUpload />
                        Import Quiz
                      </button>
                      <button
                        onClick={() => setPasteText('')}
                        className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Editor Mode */}
              {editorMode === 'manual' && (
                <div className="space-y-8">
                  {/* Quiz Settings */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium" style={{ color: '#305F72' }}>Quiz Settings</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#305F72' }}>
                          Quiz Title *
                        </label>
                        <input
                          type="text"
                          value={quiz.title}
                          onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-white border rounded-lg px-4 py-3 outline-none transition-colors focus:border-blue-500"
                          style={{
                            color: '#305F72',
                            borderColor: '#F0B7A4'
                          }}
                          placeholder="Enter quiz title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#305F72' }}>
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full bg-white border rounded-lg px-4 py-3 outline-none transition-colors focus:border-blue-500"
                          style={{
                            color: '#305F72',
                            borderColor: '#F0B7A4'
                          }}
                          placeholder="science, education, fun"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium" style={{ color: '#305F72' }}>
                        Questions ({quiz.questions.length})
                      </h3>
                      <button
                        onClick={addQuestion}
                        className="text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                        style={{ backgroundColor: '#F18C8E' }}
                      >
                        <FaPlus className="w-4 h-4" />
                        Add Question
                      </button>
                    </div>

                    {quiz.questions.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                        <div className="text-6xl mb-4">❓</div>
                        <h4 className="text-xl font-semibold mb-2" style={{ color: '#305F72' }}>No questions yet</h4>
                        <p className="mb-6" style={{ color: '#305F72', opacity: 0.8 }}>Add your first question to get started</p>
                        <button
                          onClick={addQuestion}
                          className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
                          style={{ backgroundColor: '#568EA6' }}
                        >
                          <FaPlus />
                          Add First Question
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {quiz.questions.map((question, index) => (
                          <div key={index} className="bg-white p-6 rounded-lg border shadow-sm" style={{ borderColor: '#F0B7A4' }}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold" style={{ color: '#305F72' }}>Question {index + 1}</h4>
                              <button
                                onClick={() => deleteQuestion(index)}
                                className="p-2 text-red-500 hover:text-red-600 transition-colors"
                                title="Delete question"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* Question Text */}
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#305F72' }}>
                                  Question Text *
                                </label>
                                <textarea
                                  value={question.question}
                                  onChange={(e) => updateQuestion(index, { question: e.target.value })}
                                  className="w-full bg-white border rounded-lg px-4 py-3 outline-none transition-colors resize-none focus:border-blue-500"
                                  style={{
                                    color: '#305F72',
                                    borderColor: '#F0B7A4'
                                  }}
                                  rows={2}
                                  placeholder="Enter your question"
                                />
                              </div>

                              {/* Options */}
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#305F72' }}>
                                  Answer Options *
                                </label>
                                <div className="grid md:grid-cols-2 gap-3">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="relative">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="radio"
                                          name={`correct-${index}`}
                                          checked={question.correct === optionIndex}
                                          onChange={() => updateQuestion(index, { correct: optionIndex })}
                                          className="w-4 h-4 text-green-600 bg-white"
                                          title="Mark as correct answer"
                                        />
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                          className="flex-1 bg-white border rounded-lg px-3 py-2 outline-none transition-colors focus:border-blue-500"
                                          style={{
                                            color: '#305F72',
                                            borderColor: question.correct === optionIndex ? '#10b981' : '#F0B7A4'
                                          }}
                                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                        />
                                      </div>
                                      {question.correct === optionIndex && (
                                        <div className="absolute -right-2 -top-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                          ✓ Correct
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Time Limit */}
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#305F72' }}>
                                  Time Limit (seconds)
                                </label>
                                <input
                                  type="number"
                                  min="5"
                                  max="300"
                                  value={question.time}
                                  onChange={(e) => updateQuestion(index, { time: parseInt(e.target.value) || 20 })}
                                  className="w-32 bg-white border rounded-lg px-3 py-2 outline-none transition-colors focus:border-blue-500"
                                  style={{
                                    color: '#305F72',
                                    borderColor: '#F0B7A4'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {quiz.questions.length > 0 && (
                    <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: '#F0B7A4' }}>
                      <div>
                        <h4 className="text-lg font-semibold mb-1" style={{ color: '#305F72' }}>Ready to save?</h4>
                        <p className="text-sm" style={{ color: '#305F72', opacity: 0.7 }}>
                          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} •
                          Private •
                          {tags ? ` Tags: ${tags}` : ' No tags'}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            resetEditor();
                            setActiveTab('library');
                          }}
                          className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                          style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveQuiz}
                          disabled={saving || !quiz.title.trim()}
                          className="text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                          style={{ backgroundColor: saving || !quiz.title.trim() ? '#9ca3af' : '#F18C8E' }}
                        >
                          {saving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="w-4 h-4" />
                              {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md border shadow-xl" style={{ borderColor: '#F0B7A4' }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#305F72' }}>
                <FaTrash className="text-red-500" />
                Delete Quiz
              </h3>
              <p className="mb-6" style={{ color: '#305F72', opacity: 0.7 }}>
                Are you sure you want to delete this quiz? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => deleteQuiz(showDeleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaTrash />
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200"
                  style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
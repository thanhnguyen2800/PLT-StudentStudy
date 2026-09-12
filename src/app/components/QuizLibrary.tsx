// components/QuizLibrary.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { QuizStorageService, StoredQuiz } from '../lib/quizStorage';
import { Quiz } from '../types/game';

interface QuizLibraryProps {
  onSelectQuiz: (quiz: Quiz) => void;
  onBack: () => void;
  onEditQuiz?: (quiz: StoredQuiz) => void; // New prop for editing
  mode: 'host' | 'solo' | 'manage'; // Added 'manage' mode
}

export function QuizLibrary({ onSelectQuiz, onBack, onEditQuiz, mode }: QuizLibraryProps) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const [publicQuizzes, setPublicQuizzes] = useState<StoredQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-quizzes' | 'public' | 'upload'>('my-quizzes');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Upload quiz state
  const [uploadedQuiz, setUploadedQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('paste');
  const [pasteText, setPasteText] = useState('');

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  const loadQuizzes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userQuizzes, publicQuizzesList] = await Promise.all([
        QuizStorageService.getUserQuizzes(user),
        QuizStorageService.getPublicQuizzes(50)
      ]);
      
      setQuizzes(userQuizzes);
      setPublicQuizzes(publicQuizzesList);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const quiz = JSON.parse(content) as Quiz;
        
        // Validate quiz structure
        if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
          throw new Error('Invalid quiz format');
        }
        
        setUploadedQuiz(quiz);
        setQuizTitle(quiz.title);
      } catch (error) {
        alert('Invalid quiz file. Please check the JSON format.');
        console.error('Quiz upload error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteQuiz = () => {
    try {
      const parsedQuiz = JSON.parse(pasteText);
      
      // Validate quiz structure
      if (!parsedQuiz.title || !Array.isArray(parsedQuiz.questions)) {
        throw new Error('Invalid quiz format');
      }

      // Validate questions
      parsedQuiz.questions.forEach((q: any, index: number) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1} has invalid format`);
        }
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
          throw new Error(`Question ${index + 1} has invalid correct answer index`);
        }
        if (!q.time || q.time < 5 || q.time > 300) {
          q.time = 20; // Default time
        }
      });

      setUploadedQuiz(parsedQuiz);
      setQuizTitle(parsedQuiz.title);
      setPasteText('');
    } catch (error) {
      alert('Invalid JSON format. Please check your quiz structure.');
      console.error('Parse error:', error);
    }
  };

  const saveUploadedQuiz = async () => {
    if (!uploadedQuiz || !user || !quizTitle.trim()) return;
    
    setUploading(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const quizToSave = { ...uploadedQuiz, title: quizTitle };
      
      await QuizStorageService.saveQuiz(user, quizToSave, isPublic, tagsArray);
      
      // Reset form
      setUploadedQuiz(null);
      setQuizTitle('');
      setTags('');
      setIsPublic(false);
      setPasteText('');
      setUploadMethod('paste');
      
      // Reload quizzes
      await loadQuizzes();
      setActiveTab('my-quizzes');
    } catch (error) {
      alert('Failed to save quiz. Please try again.');
      console.error('Save quiz error:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      await QuizStorageService.deleteQuiz(quizId);
      await loadQuizzes();
      setShowDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete quiz. Please try again.');
      console.error('Delete quiz error:', error);
    }
  };

  const selectQuiz = async (quiz: StoredQuiz) => {
    try {
      // Increment play count only if not in manage mode
      if (mode !== 'manage') {
        await QuizStorageService.incrementPlayCount(quiz.id);
      }
      
      // Convert StoredQuiz back to Quiz for compatibility
      const gameQuiz: Quiz = {
        title: quiz.title,
        questions: quiz.questions
      };
      
      onSelectQuiz(gameQuiz);
    } catch (error) {
      console.error('Error selecting quiz:', error);
      // Still allow playing even if count update fails
      const gameQuiz: Quiz = {
        title: quiz.title,
        questions: quiz.questions
      };
      onSelectQuiz(gameQuiz);
    }
  };

  const duplicateQuiz = async (quiz: StoredQuiz) => {
    if (!user) return;
    
    try {
      const duplicatedQuiz: Quiz = {
        title: `${quiz.title} (Copy)`,
        questions: [...quiz.questions]
      };
      
      await QuizStorageService.saveQuiz(user, duplicatedQuiz, false, quiz.tags || []);
      await loadQuizzes();
    } catch (error) {
      alert('Failed to duplicate quiz. Please try again.');
      console.error('Duplicate quiz error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Sign In</h2>
          <p className="text-slate-600 mb-6">You need to sign in to access your quiz library.</p>
          <button
            onClick={onBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (mode) {
      case 'host': return 'Choose a quiz to host';
      case 'solo': return 'Select a quiz for solo study';
      case 'manage': return 'Manage your quiz collection';
      default: return 'Quiz Library';
    }
  };

  const getSelectButtonText = () => {
    switch (mode) {
      case 'host': return 'Host Quiz';
      case 'solo': return 'Study';
      case 'manage': return 'View';
      default: return 'Select';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 p-4 sm:p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              📚 Quiz Library
            </h1>
            <p className="text-slate-600">
              {getPageTitle()}
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-white/90 hover:bg-white text-slate-700 px-6 py-3 rounded-lg transition-all duration-200 border border-slate-300 shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/70 p-1 rounded-lg mb-8 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('my-quizzes')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'my-quizzes'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/70'
            }`}
          >
            📝 My Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'public'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/70'
            }`}
          >
            🌍 Public Quizzes
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/70'
            }`}
          >
            ⬆️ Upload Quiz
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600">Loading quizzes...</span>
          </div>
        ) : (
          <>
            {/* My Quizzes Tab */}
            {activeTab === 'my-quizzes' && (
              <div>
                {quizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No quizzes yet</h3>
                    <p className="text-slate-600 mb-6">Upload your first quiz to get started!</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      Upload Quiz
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onSelect={() => selectQuiz(quiz)}
                        onEdit={onEditQuiz ? () => onEditQuiz(quiz) : undefined}
                        onDelete={() => setShowDeleteConfirm(quiz.id)}
                        onDuplicate={() => duplicateQuiz(quiz)}
                        showActions={true}
                        mode={mode}
                        selectButtonText={getSelectButtonText()}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Public Quizzes Tab */}
            {activeTab === 'public' && (
              <div>
                {publicQuizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌍</div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No public quizzes available</h3>
                    <p className="text-slate-600">Check back later for community quizzes!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onSelect={() => selectQuiz(quiz)}
                        onDuplicate={() => duplicateQuiz(quiz)}
                        showActions={false}
                        mode={mode}
                        selectButtonText={getSelectButtonText()}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upload Quiz Tab */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl border border-slate-200 shadow-lg">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6">Upload New Quiz</h2>
                  
                  {!uploadedQuiz ? (
                    <div>
                      {/* Upload Methods Tabs */}
                      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-6">
                        <button
                          onClick={() => setUploadMethod('file')}
                          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                            uploadMethod === 'file'
                              ? 'bg-orange-500 text-white shadow-lg'
                              : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                          }`}
                        >
                          📁 Upload File
                        </button>
                        <button
                          onClick={() => setUploadMethod('paste')}
                          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                            uploadMethod === 'paste'
                              ? 'bg-orange-500 text-white shadow-lg'
                              : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                          }`}
                        >
                          📋 Paste JSON
                        </button>
                      </div>

                      {/* File Upload Method */}
                      {uploadMethod === 'file' && (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                          <div className="text-4xl mb-4">📁</div>
                          <h3 className="text-lg font-medium text-slate-800 mb-2">Choose Quiz File</h3>
                          <p className="text-slate-600 mb-4">Upload a JSON file containing your quiz</p>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="quiz-upload"
                          />
                          <label
                            htmlFor="quiz-upload"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 inline-block"
                          >
                            Select File
                          </label>
                        </div>
                      )}

                      {/* Paste JSON Method */}
                      {uploadMethod === 'paste' && (
                        <div>
                          <h3 className="text-lg font-medium text-slate-800 mb-4">Paste Quiz JSON</h3>
                          <textarea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            className="w-full h-64 bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 font-mono text-sm resize-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
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
                              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                            >
                              Import Quiz
                            </button>
                            <button
                              onClick={() => setPasteText('')}
                              className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 text-sm text-slate-600">
                        <p className="mb-2"><strong>Need help creating a quiz?</strong></p>
                        <p>Use the "How to Create Quizzes" guide in the main menu for detailed instructions.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                        <h3 className="text-green-700 font-medium mb-2">✅ Quiz Loaded Successfully</h3>
                        <p className="text-sm text-green-600">
                          {uploadedQuiz.questions.length} questions found
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Quiz Title
                        </label>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                          placeholder="Enter quiz title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tags (optional)
                        </label>
                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                          placeholder="science, education, fun (comma separated)"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="make-public"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="make-public" className="text-sm text-slate-700">
                          Make this quiz public (others can discover and play it)
                        </label>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={saveUploadedQuiz}
                          disabled={uploading || !quizTitle.trim()}
                          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                        >
                          {uploading ? 'Saving...' : 'Save Quiz'}
                        </button>
                        <button
                          onClick={() => {
                            setUploadedQuiz(null);
                            setQuizTitle('');
                            setTags('');
                            setIsPublic(false);
                            setPasteText('');
                            setUploadMethod('paste');
                          }}
                          className="px-6 py-3 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md border border-slate-200 shadow-xl">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Delete Quiz</h3>
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete this quiz? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => deleteQuiz(showDeleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 py-2 px-4 rounded-lg font-semibold transition-all duration-200"
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

// Enhanced Quiz Card Component
function QuizCard({ 
  quiz, 
  onSelect, 
  onEdit,
  onDelete, 
  onDuplicate,
  showActions = true,
  mode,
  selectButtonText = 'Select'
}: { 
  quiz: StoredQuiz; 
  onSelect: () => void; 
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showActions?: boolean;
  mode: 'host' | 'solo' | 'manage';
  selectButtonText?: string;
}) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 hover:border-orange-300 transition-all duration-300 group shadow-lg hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
            {quiz.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>📝 {quiz.questions.length} questions</span>
            <span>🎮 {quiz.timesPlayed} plays</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-slate-500 hover:text-orange-500 transition-colors"
                title="Edit quiz"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="p-2 text-slate-500 hover:text-green-600 transition-colors"
                title="Duplicate quiz"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                title="Delete quiz"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {quiz.tags && quiz.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quiz.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Created {formatDate(quiz.createdAt)}
          {quiz.isPublic && (
            <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded">
              Public
            </span>
          )}
        </div>
        <button
          onClick={onSelect}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
        >
          {selectButtonText}
        </button>
      </div>
    </div>
  );
}
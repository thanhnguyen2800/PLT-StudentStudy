// components/QuizEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { QuizStorageService, StoredQuiz } from '../lib/quizStorage';
import { Quiz } from '../types/game';

interface QuizEditorProps {
  onBack: () => void;
  editingQuiz?: StoredQuiz | null; // For editing existing quizzes
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  time: number;
}

interface EditableQuiz {
  title: string;
  questions: Question[];
}

export function QuizEditor({ onBack, editingQuiz }: QuizEditorProps) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<EditableQuiz>({
    title: '',
    questions: []
  });
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'paste'>('edit');

  // Initialize with existing quiz if editing
  useEffect(() => {
    if (editingQuiz) {
      setQuiz({
        title: editingQuiz.title,
        questions: [...editingQuiz.questions]
      });
      setIsPublic(editingQuiz.isPublic || false);
      setTags(editingQuiz.tags?.join(', ') || '');
    }
  }, [editingQuiz]);

  // Add a new blank question
  const addQuestion = () => {
    const newQuestion: Question = {
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

  // Update a specific question
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  // Update a specific option for a question
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

  // Delete a question
  const deleteQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Move question up/down
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= quiz.questions.length) return;

    setQuiz(prev => {
      const newQuestions = [...prev.questions];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      return { ...prev, questions: newQuestions };
    });
  };

  // Handle pasting JSON quiz
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

      setQuiz(parsedQuiz);
      setPasteText('');
      setShowPasteModal(false);
      setActiveTab('edit');
    } catch (error) {
      alert('Invalid JSON format. Please check your quiz structure.');
      console.error('Parse error:', error);
    }
  };

  // Save quiz
  const saveQuiz = async () => {
    if (!user || !user.emailVerified) {
      alert('Vui lòng xác minh email trước khi tạo Quiz.');
      return;
    }

    if (!quiz.title.trim() || quiz.questions.length === 0) {
      alert('Please add a title and at least one question');
      return;
    }

    // Validate all questions
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question.trim()) {
        alert(`Question ${i + 1} is missing question text`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question ${i + 1} has empty options`);
        return;
      }
    }

    setSaving(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      if (editingQuiz) {
        // Update existing quiz
        await QuizStorageService.updateQuiz(editingQuiz.id, {
          ...quiz,
          isPublic,
          tags: tagsArray
        });
        alert('Quiz updated successfully!');
      } else {
        // Create new quiz
        await QuizStorageService.saveQuiz(user, quiz, isPublic, tagsArray);
        alert('Quiz saved successfully!');
      }
      
      onBack();
    } catch (error) {
      alert('Failed to save quiz. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-slate-600 mb-6">Bạn cần đăng nhập để tạo hoặc chỉnh sửa Quiz.</p>
          <button
            onClick={onBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Về menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 p-4 sm:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {editingQuiz ? '✏️ Chỉnh sửa Quiz' : '📝 Tạo Quiz'}
            </h1>
            <p className="text-slate-600">
              {editingQuiz ? 'Chỉnh sửa Quiz hiện có' : 'Tạo Quiz từ đầu hoặc dán JSON'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-white/90 hover:bg-white text-slate-700 px-6 py-3 rounded-lg transition-all duration-200 border border-slate-300 shadow-sm"
          >
            ← Quay lại
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/70 p-1 rounded-lg mb-8 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'edit'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/70'
            }`}
          >
            ✏️ Chỉnh sửa Quiz
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'paste'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/70'
            }`}
          >
            📋 Dán JSON
          </button>
        </div>

        {/* Paste JSON Tab */}
        {activeTab === 'paste' && (
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl border border-slate-200 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Dán JSON của Quiz</h2>
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
                Nhập Quiz
              </button>
              <button
                onClick={() => setPasteText('')}
                className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Edit Quiz Tab */}
        {activeTab === 'edit' && (
          <div className="space-y-8">
            {/* Quiz Settings */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Cài đặt Quiz</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tiêu đề Quiz *
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    placeholder="Nhập tiêu đề Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thẻ (cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    placeholder="science, education, fun"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="make-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="make-public" className="text-sm text-slate-700">
                    Công khai Quiz này (người khác có thể tìm và chơi)
                </label>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">
                  Câu hỏi ({quiz.questions.length})
                </h2>
                <button
                  onClick={addQuestion}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm câu hỏi
                </button>
              </div>

              {quiz.questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❓</div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Chưa có câu hỏi</h3>
                  <p className="text-slate-600 mb-6">Thêm câu hỏi đầu tiên để bắt đầu</p>
                  <button
                    onClick={addQuestion}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Thêm câu hỏi đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Câu hỏi {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Di chuyển lên"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === quiz.questions.length - 1}
                            className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Di chuyển xuống"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteQuestion(index)}
                            className="p-2 text-red-500 hover:text-red-600 transition-colors"
                            title="Xóa câu hỏi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nội dung câu hỏi *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(index, { question: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors resize-none"
                            rows={2}
                            placeholder="Nhập câu hỏi"
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Các lựa chọn trả lời *
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
                                    className="w-4 h-4 text-green-600 bg-white border-slate-300 focus:ring-green-500"
                                    title="Đánh dấu là đáp án đúng"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    className={`flex-1 bg-white border rounded-lg px-3 py-2 text-slate-800 placeholder-slate-500 focus:ring-1 outline-none transition-colors ${
                                      question.correct === optionIndex 
                                        ? 'border-green-500 focus:border-green-400 focus:ring-green-500' 
                                        : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500'
                                    }`}
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                  />
                                </div>
                                {question.correct === optionIndex && (
                                  <div className="absolute -right-2 -top-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    ✓ Đúng
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Time Limit */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Giới hạn thời gian (giây)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={question.time}
                            onChange={(e) => updateQuestion(index, { time: parseInt(e.target.value) || 20 })}
                            className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
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
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Sẵn sàng lưu?</h3>
                    <p className="text-slate-600 text-sm">
                      {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} • 
                      {isPublic ? ' Public' : ' Private'} • 
                      {tags ? ` Tags: ${tags}` : ' No tags'}
                    </p>
                  </div>
                  <button
                    onClick={saveQuiz}
                    disabled={saving || !quiz.title.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {editingQuiz ? 'Cập nhật Quiz' : 'Lưu Quiz'}
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
  );
}
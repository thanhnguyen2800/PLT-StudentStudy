'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Clock, Hash, Trophy, Trash2, AlertCircle } from 'lucide-react';
import { Quiz, Game } from '../types/game';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { getLeaderboard } from '../utils/gameUtils';
import { gameCleanupManager, updateGameActivity } from '../utils/gameCleanup';
import { ref, remove } from 'firebase/database';
import { database } from '../lib/firebase';

interface GameHostProps {
  gamePin: string;
  quiz: Quiz;
}

export default function GameHost({ gamePin, quiz }: GameHostProps) {
  const { data: gameData, loading, error, updateData } = useFirebaseData<Game>(`games/${gamePin}`);
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [timer, setTimer] = useState(0);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'question' | 'results' | 'finished'>('waiting');
  const [cleanupScheduled, setCleanupScheduled] = useState(false);
  const [activityHeartbeat, setActivityHeartbeat] = useState<NodeJS.Timeout | null>(null);

  const players = gameData?.players || {};
  const playerCount = Object.keys(players).length;
  const totalQuestions = quiz.questions.length;

  // Update activity periodically to prevent auto-cleanup while host is active
  useEffect(() => {
    if (gamePin && gameData) {
      console.log('💓 Starting activity heartbeat for game', gamePin);

      // Send activity update every 2 minutes
      const heartbeat = setInterval(() => {
        updateGameActivity(gamePin, {
          status: gameData.status,
          hostHeartbeat: Date.now()
        });
        console.log('💓 Host activity heartbeat sent for game', gamePin);
      }, 2 * 60 * 1000); // 2 minutes

      setActivityHeartbeat(heartbeat);

      // Initial activity update
      updateGameActivity(gamePin, {
        status: gameData.status,
        hostHeartbeat: Date.now()
      });

      return () => {
        if (heartbeat) {
          clearInterval(heartbeat);
          console.log('💓 Stopped activity heartbeat for game', gamePin);
        }
      };
    }
  }, [gamePin, gameData?.status]);

  // Helper function to update game data and activity
  const updateGameDataWithActivity = useCallback(async (newData: Partial<Game>) => {
    const updatedData = {
      ...gameData!,
      ...newData,
      lastActivity: Date.now()
    };

    await updateData(updatedData);

    // Update cleanup schedule
    gameCleanupManager.scheduleCleanup(gamePin, updatedData.status as string);

    return updatedData;
  }, [gameData, updateData, gamePin]);

  // Define showQuestionResults with useCallback to prevent recreating on every render
  const showQuestionResults = useCallback(async () => {
    console.log('📊 Showing question results');
    console.log(`❓ Question ${currentQuestion + 1} of ${totalQuestions}: "${quiz.questions[currentQuestion]?.question}"`);

    try {
      setGameStatus('results');

      await updateGameDataWithActivity({
        status: 'results'
      });

      // Log answer statistics
      const currentQ = quiz.questions[currentQuestion];
      const correctAnswers = Object.values(players).filter(p =>
        p.answers?.[currentQuestion] === currentQ?.correct
      ).length;

      console.log(`📈 Results: ${correctAnswers}/${playerCount} players got it right`);
      console.log(`✅ Correct answer was: "${currentQ?.options[currentQ.correct]}"`);

      console.log('✅ Results shown successfully');
    } catch (error) {
      console.error('❌ Error showing results:', error);
    }
  }, [currentQuestion, totalQuestions, quiz.questions, players, playerCount, updateGameDataWithActivity]);

  const cleanupGame = useCallback(async () => {
    try {
      console.log(`🗑️ Cleaning up game ${gamePin} from Firebase`);

      // Stop heartbeat
      if (activityHeartbeat) {
        clearInterval(activityHeartbeat);
        setActivityHeartbeat(null);
      }

      // Cancel any scheduled cleanup
      gameCleanupManager.cancelCleanup(gamePin);

      // Remove from Firebase
      const gameRef = ref(database, `games/${gamePin}`);
      await remove(gameRef);

      console.log(`✅ Game ${gamePin} successfully removed from Firebase`);
    } catch (error) {
      console.error(`❌ Error cleaning up game ${gamePin}:`, error);
    }
  }, [gamePin, activityHeartbeat]);

  useEffect(() => {
    console.log('🎮 Game Host - Data updated');
    console.log(`📊 Game status: ${gameData?.status}, Current question: ${gameData?.currentQuestion}, Players: ${playerCount}`);
    console.log(`📝 Quiz has ${totalQuestions} questions total`);
    if (gameData?.players) {
      console.log('👥 Player list:', Object.keys(gameData.players).map(id => gameData.players[id].name));
    }

    // Sync local state with Firebase data
    if (gameData) {
      setCurrentQuestion(gameData.currentQuestion);
      setGameStatus(gameData.status as any);
    }
  }, [gameData, playerCount, totalQuestions]);

  // Separate effect to check if all players have answered
  useEffect(() => {
    if (gameStatus === 'question' && currentQuestion >= 0 && playerCount > 0 && timer > 0) {
      const playersAnswered = Object.values(players).filter(p =>
        p.answers?.[currentQuestion] !== undefined
      ).length;

      console.log(`📊 Answer progress: ${playersAnswered}/${playerCount} players answered`);

      if (playersAnswered === playerCount) {
        console.log('🚀 All players answered! Auto-advancing to results...');
        showQuestionResults();
      }
    }
  }, [players, gameStatus, currentQuestion, playerCount, timer, showQuestionResults]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && gameStatus === 'question') {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            console.log('⏰ Timer expired, showing results');
            showQuestionResults();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, gameStatus, showQuestionResults]);

  // Auto-cleanup when game is finished
  useEffect(() => {
    if (gameStatus === 'finished' && !cleanupScheduled) {
      console.log('🗑️ Scheduling game cleanup in 5 minutes');
      setCleanupScheduled(true);

      // The cleanup manager will handle this automatically
      gameCleanupManager.scheduleCleanup(gamePin, 'finished');
    }
  }, [gameStatus, cleanupScheduled, gamePin]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (activityHeartbeat) {
        clearInterval(activityHeartbeat);
      }
      // Don't auto-cleanup on unmount unless game is finished
      if (gameStatus === 'finished') {
        gameCleanupManager.scheduleCleanup(gamePin, 'finished');
      }
    };
  }, [activityHeartbeat, gameStatus, gamePin]);

  const manualCleanup = async () => {
    if (window.confirm('Are you sure you want to delete this game? All players will be disconnected.')) {
      await cleanupGame();
      // Navigate back to menu (you might want to call a callback here)
      window.location.reload();
    }
  };

  const startGame = async () => {
    console.log('🚀 Starting game');
    console.log(`📝 Quiz: "${quiz.title}" with ${totalQuestions} questions`);
    console.log(`👥 Starting with ${playerCount} players`);

    try {
      setCurrentQuestion(0);
      setGameStatus('question');
      setTimer(quiz.questions[0].time);

      await updateGameDataWithActivity({
        status: 'question',
        currentQuestion: 0,
        questionStartTime: Date.now()
      });

      console.log('✅ Game started successfully');
      console.log(`❓ First question: "${quiz.questions[0].question}"`);
      console.log(`⏱️ Timer set to: ${quiz.questions[0].time} seconds`);
    } catch (error) {
      console.error('❌ Error starting game:', error);
    }
  };

  const nextQuestion = async () => {
    const next = currentQuestion + 1;
    console.log(`➡️ Attempting to move to question ${next + 1} of ${totalQuestions}`);
    console.log(`🔍 Current question index: ${currentQuestion}, Next: ${next}, Total: ${totalQuestions}`);

    try {
      if (next < totalQuestions) {
        console.log(`✅ Moving to question ${next + 1} of ${totalQuestions}`);

        setCurrentQuestion(next);
        setGameStatus('question');
        setTimer(quiz.questions[next].time);

        await updateGameDataWithActivity({
          status: 'question',
          currentQuestion: next,
          questionStartTime: Date.now()
        });

        console.log(`✅ Successfully moved to question ${next + 1}`);
        console.log(`❓ New question: "${quiz.questions[next].question}"`);
        console.log(`⏱️ Timer set to: ${quiz.questions[next].time} seconds`);
      } else {
        console.log(`🏁 All ${totalQuestions} questions completed, ending game`);
        console.log(`📊 Final question was ${currentQuestion + 1} of ${totalQuestions}`);
        endGame();
      }
    } catch (error) {
      console.error('❌ Error moving to next question:', error);
    }
  };

  const endGame = async () => {
    console.log('🏁 Ending game');
    console.log(`📊 Final stats: ${totalQuestions} questions completed with ${playerCount} players`);

    try {
      setGameStatus('finished');
      await updateGameDataWithActivity({
        status: 'finished'
      });

      // Log final leaderboard
      const leaderboard = getLeaderboard(players);
      console.log('🏆 Final Leaderboard:');
      leaderboard.slice(0, 5).forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.playerName}: ${entry.score} points`);
      });

      console.log('✅ Game ended successfully');
    } catch (error) {
      console.error('❌ Error ending game:', error);
    }
  };

  const currentQ = quiz.questions[currentQuestion];
  const correctAnswers = Object.values(players).filter(p =>
    p.answers?.[currentQuestion] === currentQ?.correct
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4F8' }}>
        <div className="bg-white/90 rounded-xl shadow-2xl p-8 text-center border" style={{ borderColor: '#F0B7A4' }}>
          <div className="text-xl" style={{ color: '#305F72' }}>Loading game data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4F8' }}>
        <div className="bg-white/90 rounded-xl shadow-2xl p-8 text-center border" style={{ borderColor: '#F0B7A4' }}>
          <div className="text-red-600 text-xl mb-4">❌ Error loading game</div>
          <div style={{ color: '#305F72', opacity: 0.8 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-20" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 rounded-xl shadow-2xl p-6 sm:p-8 border" style={{ borderColor: '#F0B7A4' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#305F72' }}>{quiz.title}</h1>
              <p style={{ color: '#305F72', opacity: 0.8 }}>Total Questions: {totalQuestions}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-lg border" style={{ backgroundColor: '#F0B7A4', borderColor: '#F0B7A4' }}>
                <Hash className="w-4 h-4 inline mr-1" style={{ color: '#305F72' }} />
                <span className="font-mono" style={{ color: '#305F72' }}>{gamePin}</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <Users className="w-4 h-4 inline mr-1 text-green-600" />
                <span className="font-semibold text-green-700">{playerCount}</span>
              </div>
              {gameStatus === 'finished' && (
                <button
                  onClick={manualCleanup}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                  title="Delete game from database"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Game</span>
                </button>
              )}
            </div>
          </div>

          {/* Auto-cleanup status indicator */}
          <div className="bg-white px-4 py-3 rounded-lg mb-6 backdrop-blur-sm border" style={{ borderColor: '#568EA6' }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: '#568EA6' }} />
              <span className="text-sm" style={{ color: '#305F72' }}>
                <strong>Auto-cleanup:</strong> {
                  gameStatus === 'waiting' ? 'Game will be deleted in 10min if no players join' :
                    gameStatus === 'question' || gameStatus === 'results' ? 'Game will be deleted after 30min of inactivity' :
                      gameStatus === 'finished' ? 'Game will be deleted in 5min' :
                        'Monitoring for auto-cleanup'
                }
              </span>
            </div>
          </div>

          {gameStatus === 'waiting' && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: '#305F72' }}>Waiting for players...</h2>
              <div className="mb-6" style={{ color: '#305F72', opacity: 0.8 }}>
                Quiz ready: <strong style={{ color: '#305F72' }}>{totalQuestions} questions</strong>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {Object.entries(players).map(([id, player]) => (
                  <div key={id} className="bg-white p-4 rounded-lg border" style={{ borderColor: '#F0B7A4' }}>
                    <div className="font-semibold" style={{ color: '#305F72' }}>{player.name}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={startGame}
                disabled={playerCount === 0}
                className="text-white py-4 px-8 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                style={{ backgroundColor: playerCount === 0 ? '#9ca3af' : '#10b981' }}
              >
                Start Game ({totalQuestions} Questions)
              </button>
            </div>
          )}

          {gameStatus === 'question' && currentQ && (
            <div className="text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <span className="text-lg font-semibold" style={{ color: '#305F72' }}>
                  Question {currentQuestion + 1} of {totalQuestions}
                </span>
                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-700">{timer}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="rounded-full h-3 mb-2" style={{ backgroundColor: '#F0B7A4' }}>
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: '#568EA6',
                      width: `${((currentQuestion + 1) / totalQuestions) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>
                  Progress: {currentQuestion + 1} of {totalQuestions} questions
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: '#305F72' }}>{currentQ.question}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl text-lg sm:text-xl font-semibold text-white shadow-lg"
                    style={{
                      backgroundColor: index === 0 ? '#ef4444' :
                        index === 1 ? '#568EA6' :
                          index === 2 ? '#F18C8E' :
                            '#10b981'
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>

              <div className="text-lg bg-white p-3 rounded-lg border" style={{ color: '#305F72', borderColor: '#F0B7A4' }}>
                {Object.values(players).filter(p => p.answers?.[currentQuestion] !== undefined).length} / {playerCount} answered
                {Object.values(players).filter(p => p.answers?.[currentQuestion] !== undefined).length === playerCount && playerCount > 0 && (
                  <div className="text-green-600 text-sm mt-1 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    All answered! Moving to results...
                  </div>
                )}
              </div>
            </div>
          )}

          {gameStatus === 'results' && currentQ && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: '#305F72' }}>Question {currentQuestion + 1} Results</h2>
              <div className="bg-green-50 p-6 rounded-xl mb-8 border border-green-200">
                <div className="text-lg font-semibold text-green-700 mb-2">
                  Correct Answer: {currentQ.options[currentQ.correct]}
                </div>
                <div className="text-green-600">
                  {correctAnswers} / {playerCount} got it right
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#305F72' }}>Current Leaderboard</h3>
                <div className="space-y-3">
                  {getLeaderboard(players).slice(0, 5).map((entry, index) => (
                    <div key={entry.playerId} className="flex justify-between items-center bg-white p-4 rounded-lg border" style={{ borderColor: '#F0B7A4' }}>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg" style={{ color: '#305F72' }}>#{index + 1}</span>
                        <span className="font-semibold" style={{ color: '#305F72' }}>{entry.playerName}</span>
                      </div>
                      <span className="font-bold" style={{ color: '#568EA6' }}>{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg border" style={{ borderColor: '#F0B7A4' }}>
                  <div className="font-semibold" style={{ color: '#305F72' }}>
                    {currentQuestion + 1 < totalQuestions
                      ? `Next: Question ${currentQuestion + 2} of ${totalQuestions}`
                      : 'This was the final question!'
                    }
                  </div>
                </div>
              </div>

              <button
                onClick={nextQuestion}
                className="text-white py-4 px-8 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#568EA6' }}
              >
                {currentQuestion + 1 < totalQuestions
                  ? `Next Question (${currentQuestion + 2}/${totalQuestions})`
                  : 'End Game'
                }
              </button>
            </div>
          )}

          {gameStatus === 'finished' && (
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#F18C8E' }} />
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#305F72' }}>Game Finished!</h2>
              <div className="text-lg mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Completed all {totalQuestions} questions with {playerCount} players
              </div>

              <div className="bg-white border px-4 py-3 rounded-lg mb-6 backdrop-blur-sm" style={{ borderColor: '#F18C8E' }}>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#F18C8E' }} />
                  <span className="text-sm" style={{ color: '#305F72' }}>Game will be automatically deleted in 5 minutes</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl mb-8 border" style={{ borderColor: '#F0B7A4' }}>
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#305F72' }}>Final Leaderboard</h3>
                <div className="space-y-4">
                  {getLeaderboard(players).map((entry, index) => (
                    <div key={entry.playerId} className={`flex justify-between items-center p-4 rounded-lg border ${index === 0 ? 'bg-yellow-50 border-yellow-300' :
                      index === 1 ? 'bg-gray-50 border-gray-300' :
                        index === 2 ? 'bg-orange-50 border-orange-300' :
                          'bg-white'
                      }`} style={index > 2 ? { borderColor: '#F0B7A4' } : {}}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <span className="font-semibold text-lg" style={{ color: '#305F72' }}>{entry.playerName}</span>
                      </div>
                      <span className="font-bold text-xl" style={{ color: '#568EA6' }}>{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={manualCleanup}
                  className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Game Now
                </button>
                <div className="text-sm" style={{ color: '#305F72', opacity: 0.6 }}>
                  or wait for automatic cleanup
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
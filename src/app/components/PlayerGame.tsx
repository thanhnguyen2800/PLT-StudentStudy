'use client';

import { useState, useEffect } from 'react';
import { FiHash, FiAward, FiLoader, FiWifi } from 'react-icons/fi';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { Game, Player } from '../types/game';
import { calculateScore, getLeaderboard } from '../utils/gameUtils';

interface PlayerGameProps {
  gamePin: string;
  playerId: string;
  playerName: string;
}

export default function PlayerGame({ gamePin, playerId, playerName }: PlayerGameProps) {
  const { data: gameData, loading, error, updateData } = useFirebaseData<Game>(`games/${gamePin}`);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [localCurrentQuestion, setLocalCurrentQuestion] = useState(-1);
  const [localGameStatus, setLocalGameStatus] = useState<'waiting' | 'question' | 'results' | 'finished'>('waiting');

  // Sync with the actual game data from Firebase
  const game = gameData;
  const currentQuestion = game?.currentQuestion ?? -1;
  const gameStatus = game?.status || 'waiting';
  const question = currentQuestion >= 0 ? game?.quiz?.questions?.[currentQuestion] : null;
  const playerData = game?.players?.[playerId];

  // Main sync effect - handles all game state changes from Firebase
  useEffect(() => {
    if (!game) return;

    console.log(`🎮 Player "${playerName}" - Firebase data updated`);
    console.log(`📊 Firebase state: Status=${gameStatus}, Question=${currentQuestion}, Local Question=${localCurrentQuestion}`);

    // Check if game status changed
    if (gameStatus !== localGameStatus) {
      console.log(`🔄 Game status changed: ${localGameStatus} → ${gameStatus}`);
      setLocalGameStatus(gameStatus);
    }

    // Check if question changed
    if (currentQuestion !== localCurrentQuestion) {
      console.log(`🔄 Question changed: ${localCurrentQuestion} → ${currentQuestion}`);
      setLocalCurrentQuestion(currentQuestion);

      // Reset answer state for new question
      if (currentQuestion >= 0) {
        const hasAnsweredThisQuestion = playerData?.answers?.[currentQuestion] !== undefined;

        if (!hasAnsweredThisQuestion) {
          console.log(`🆕 New question ${currentQuestion + 1} - resetting answer state`);
          setHasAnswered(false);
          setSelectedAnswer(null);
        } else {
          console.log(`✅ Already answered question ${currentQuestion + 1}`);
          setHasAnswered(true);
          setSelectedAnswer(playerData.answers[currentQuestion]);
        }
      }
    }

    // Log current state for debugging
    if (game?.players) {
      console.log(`👥 ${Object.keys(game.players).length} players in game`);
    }

    if (question) {
      console.log(`❓ Current question: "${question.question}"`);
    }
  }, [gameData, game, gameStatus, currentQuestion, localGameStatus, localCurrentQuestion, playerName, playerData, question]);

  const submitAnswer = async (answerIndex: number) => {
    if (hasAnswered || gameStatus !== 'question' || !question || !game || currentQuestion < 0) {
      console.log(`⚠️ Cannot submit answer - Player: ${playerName}, HasAnswered: ${hasAnswered}, Status: ${gameStatus}, Question: ${currentQuestion}`);
      return;
    }

    console.log(`📝 Player "${playerName}" submitting answer ${answerIndex} (${question.options[answerIndex]}) for question ${currentQuestion + 1}`);

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    try {
      const isCorrect = answerIndex === question.correct;
      const points = calculateScore(isCorrect, game.questionStartTime || Date.now(), question.time);

      const newScore = (playerData?.score || 0) + points;
      const newAnswers = { ...(playerData?.answers || {}), [currentQuestion]: answerIndex };

      console.log(`💯 Score calculation for "${playerName}": Correct=${isCorrect}, Points=${points}, NewScore=${newScore}`);

      const updatedPlayer: Player = {
        ...playerData!,
        score: newScore,
        answers: newAnswers
      };

      // Update player data in Firebase
      const updatedGame = {
        ...game,
        players: {
          ...game.players,
          [playerId]: updatedPlayer
        }
      };

      await updateData(updatedGame);

      console.log(`✅ Answer submitted successfully for player "${playerName}"`);
    } catch (error) {
      console.error(`❌ Error submitting answer for player "${playerName}":`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-[#F0B7A4]/50">
          <FiLoader className="w-8 h-8 text-[#568EA6] animate-spin mx-auto mb-4" />
          <div className="text-xl font-semibold text-[#305F72]">Loading...</div>
          <div className="mt-2 text-sm text-[#305F72]/70 font-medium">
            Connecting to game {gamePin}...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-[#F0B7A4]/50">
          <div className="text-[#F18C8E] text-xl mb-4 font-semibold">❌ Connection Error</div>
          <div className="text-[#305F72]/70 mb-4 font-medium">{error}</div>
          <div className="text-sm text-[#305F72]/50 font-medium">
            Please check your internet connection and try again.
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-[#F0B7A4]/50">
          <div className="text-[#F18C8E] text-xl mb-4 font-semibold">❌ Game Not Found</div>
          <div className="text-[#305F72]/70 font-medium">
            Game with PIN {gamePin} does not exist or has been removed.
          </div>
        </div>
      </div>
    );
  }

  // Debug info for troubleshooting
  console.log(`🔍 Render check - Status: ${gameStatus}, Question: ${currentQuestion}, Has Question Object: ${!!question}`);

  if (gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#F0B7A4]/50 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-[#305F72]">Welcome, {playerName}!</h1>

            <div className="bg-[#568EA6]/10 backdrop-blur-sm p-6 rounded-xl mb-6 border border-[#568EA6]/30 shadow-sm">
              <FiHash className="w-8 h-8 mx-auto mb-3 text-[#568EA6]" />
              <div className="font-mono text-3xl text-[#568EA6] font-bold">{gamePin}</div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-[#305F72]">Quiz: {game.quiz.title}</h3>
              <p className="text-[#305F72]/70 font-medium">{game.quiz.questions.length} questions</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-[#305F72]">Players in lobby:</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.values(game.players).map((player, index) => (
                  <span
                    key={index}
                    className={`px-3 py-2 rounded-full text-sm border ${player.name === playerName
                        ? 'bg-[#568EA6] text-white border-[#568EA6] font-semibold shadow-lg'
                        : 'bg-[#F0B7A4]/20 backdrop-blur-sm text-[#305F72] border-[#F0B7A4]/50'
                      }`}
                  >
                    {player.name}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[#305F72]/70 mb-6 font-medium">Waiting for the host to start the game...</p>

            {/* Live status indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-[#568EA6] bg-[#568EA6]/10 backdrop-blur-sm p-3 rounded-xl border border-[#568EA6]/30 shadow-sm">
              <FiWifi className="w-4 h-4 text-[#568EA6]" />
              <span className="font-medium">Connected • Waiting for host</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'question' && currentQuestion >= 0 && question) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#F0B7A4]/50">
            <div className="text-center mb-6">
              <div className="bg-[#568EA6]/10 backdrop-blur-sm p-4 rounded-xl mb-4 border border-[#568EA6]/30 shadow-sm">
                <span className="font-semibold text-[#568EA6] text-lg">
                  Question {currentQuestion + 1} of {game.quiz.questions.length}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#305F72] mb-4 leading-tight">{question.question}</h2>
            </div>

            {!hasAnswered ? (
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(`🖱️ Player "${playerName}" clicked option ${index} (${option})`);
                      submitAnswer(index);
                    }}
                    className={`p-4 sm:p-5 rounded-xl text-white font-semibold text-left transition-all duration-200 hover:scale-[1.02] active:scale-98 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${index === 0 ? 'bg-[#F18C8E] hover:bg-[#F18C8E]/90 focus:ring-[#F18C8E]' :
                        index === 1 ? 'bg-[#568EA6] hover:bg-[#568EA6]/90 focus:ring-[#568EA6]' :
                          index === 2 ? 'bg-[#8B7BB8] hover:bg-[#8B7BB8]/90 focus:ring-[#8B7BB8]' :
                            'bg-[#7FB069] hover:bg-[#7FB069]/90 focus:ring-[#7FB069]'
                      }`}
                    disabled={hasAnswered}
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
            ) : (
              <div className="text-center">
                <div className="bg-[#7FB069]/20 backdrop-blur-sm p-6 rounded-xl mb-6 border border-[#7FB069]/50 shadow-sm">
                  <span className="text-[#7FB069] font-semibold text-lg">✅ Answer Submitted!</span>
                </div>
                <div className="text-[#305F72] mb-6 bg-[#F0B7A4]/20 backdrop-blur-sm p-4 rounded-xl border border-[#F0B7A4]/50 shadow-sm">
                  You chose: <span className="font-semibold text-[#305F72]">{question.options[selectedAnswer!]}</span>
                </div>
                <div className="bg-[#568EA6]/10 backdrop-blur-sm p-6 rounded-xl mb-6 border border-[#568EA6]/30 shadow-sm">
                  <div className="text-[#568EA6] text-sm mb-1 font-medium">Your Current Score</div>
                  <div className="text-3xl font-bold text-[#568EA6]">{playerData?.score || 0}</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-[#568EA6] bg-[#568EA6]/10 backdrop-blur-sm p-3 rounded-xl border border-[#568EA6]/30 shadow-sm">
                  <div className="w-2 h-2 bg-[#568EA6] rounded-full animate-pulse"></div>
                  <span className="font-medium">Waiting for other players...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'results' && currentQuestion >= 0 && question) {
    const isCorrect = selectedAnswer === question.correct;
    const leaderboard = getLeaderboard(game.players);
    const myRank = leaderboard.find(entry => entry.playerId === playerId)?.rank || 0;

    console.log(`📊 Results for "${playerName}": ${isCorrect ? 'Correct' : 'Wrong'}, Rank: ${myRank}`);

    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#F0B7A4]/50 text-center">
            <div className={`p-6 rounded-xl mb-6 border backdrop-blur-sm shadow-sm ${isCorrect ? 'bg-[#7FB069]/20 border-[#7FB069]/50' : 'bg-[#F18C8E]/20 border-[#F18C8E]/50'}`}>
              <div className={`text-2xl font-bold ${isCorrect ? 'text-[#7FB069]' : 'text-[#F18C8E]'}`}>
                {isCorrect ? '🎉 Correct!' : '❌ Wrong'}
              </div>
              {!isCorrect && selectedAnswer !== null && (
                <div className="text-sm text-[#305F72]/70 mt-3 font-medium">
                  You selected: {question.options[selectedAnswer]}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-[#305F72]/70 mb-3 font-medium">Correct Answer:</div>
              <div className="font-semibold text-lg p-4 bg-[#7FB069]/20 backdrop-blur-sm rounded-xl text-[#7FB069] border border-[#7FB069]/50 shadow-sm">
                {question.options[question.correct]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#568EA6]/10 backdrop-blur-sm p-4 rounded-xl border border-[#568EA6]/30 shadow-sm">
                <div className="text-[#568EA6] mb-1 text-sm font-medium">Your Score</div>
                <div className="text-2xl font-bold text-[#568EA6]">{playerData?.score || 0}</div>
              </div>
              <div className="bg-[#F0B7A4]/20 backdrop-blur-sm p-4 rounded-xl border border-[#F0B7A4]/50 shadow-sm">
                <div className="text-[#305F72] mb-1 text-sm font-medium">Your Rank</div>
                <div className="text-2xl font-bold text-[#305F72]">#{myRank}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#568EA6] bg-[#568EA6]/10 backdrop-blur-sm p-3 rounded-xl border border-[#568EA6]/30 shadow-sm">
              <div className="w-2 h-2 bg-[#568EA6] rounded-full animate-pulse"></div>
              <span className="font-medium">Waiting for next question...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    const leaderboard = getLeaderboard(game.players);
    const myEntry = leaderboard.find(entry => entry.playerId === playerId);
    const playerRank = myEntry?.rank || 0;

    console.log(`🏁 Game finished for "${playerName}": Final rank ${playerRank} with ${playerData?.score || 0} points`);

    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#F0B7A4]/50 text-center">
            <FiAward className="w-16 h-16 mx-auto mb-4 text-[#568EA6]" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-[#305F72]">Game Over!</h1>

            <div className="bg-[#568EA6]/10 backdrop-blur-sm p-6 rounded-xl mb-6 border border-[#568EA6]/30 shadow-sm">
              <div className="text-lg mb-2 text-[#305F72] font-medium">Your Final Rank</div>
              <div className="text-4xl font-bold text-[#305F72] mb-2">
                {playerRank === 1 ? '🥇' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : `#${playerRank}`}
              </div>
              <div className="text-2xl font-semibold text-[#568EA6] mb-2">
                {playerData?.score || 0} points
              </div>
              <div className="text-sm text-[#568EA6] font-medium">
                {playerRank === 1 && '🎉 Champion!'}
                {playerRank === 2 && '🎊 Runner-up!'}
                {playerRank === 3 && '🏆 Third place!'}
                {playerRank > 3 && 'Great job!'}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-[#305F72]">Final Leaderboard</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.playerId}
                    className={`flex justify-between items-center p-3 rounded-xl border backdrop-blur-sm shadow-sm ${entry.playerId === playerId
                        ? 'bg-[#568EA6]/10 border-[#568EA6]/30'
                        : 'bg-[#F0B7A4]/10 border-[#F0B7A4]/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span className={`font-semibold ${entry.playerId === playerId
                          ? 'text-[#568EA6]'
                          : 'text-[#305F72]'
                        }`}>
                        {entry.playerName}
                      </span>
                    </div>
                    <span className={`font-bold ${entry.playerId === playerId
                        ? 'text-[#568EA6]'
                        : 'text-[#305F72]'
                      }`}>
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[#305F72]/70 bg-[#F0B7A4]/10 backdrop-blur-sm p-4 rounded-xl border border-[#F0B7A4]/30 shadow-sm font-medium">
              Thanks for playing, {playerName}!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unexpected states
  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-[#F0B7A4]/50">
        <p className="text-[#305F72]/70 font-medium">Loading game state...</p>
        <div className="mt-2 text-xs text-[#305F72]/50 font-medium">
          Status: {gameStatus}, Question: {currentQuestion}
        </div>
        <div className="mt-2 text-xs text-[#305F72]/50 font-medium">
          Has Question: {question ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}
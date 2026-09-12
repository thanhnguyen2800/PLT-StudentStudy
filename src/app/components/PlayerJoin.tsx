'use client';

import { useState } from 'react';
import { FiAlertTriangle, FiInfo, FiLoader } from 'react-icons/fi';
import { generatePlayerId } from '../utils/gameUtils';
import { Game, Player } from '../types/game';
import { ref, get, set } from 'firebase/database';
import { database } from '../lib/firebase';

interface PlayerJoinProps {
  onJoinGame: (pin: string, id: string, name: string) => void;
}

export default function PlayerJoin({ onJoinGame }: PlayerJoinProps) {
  const [gamePin, setGamePin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const joinGame = async () => {
    if (!gamePin || !playerName) {
      console.warn('⚠️ Attempted to join without PIN or name');
      setError('Please enter both game PIN and your name');
      return;
    }

    // Final validation - ensure PIN is exactly 6 digits
    if (gamePin.length !== 6 || !/^\d{6}$/.test(gamePin)) {
      console.warn('⚠️ Invalid PIN format');
      setError('Game PIN must be exactly 6 digits');
      return;
    }

    console.log(`🎮 Player "${playerName}" attempting to join game ${gamePin}`);
    setJoining(true);
    setError('');

    try {
      // Check if game exists first using Firebase directly
      console.log('🔍 Checking if game exists...');
      const gameRef = ref(database, `games/${gamePin}`);
      const snapshot = await get(gameRef);

      if (!snapshot.exists()) {
        console.error('❌ Game not found');
        throw new Error('Game not found. Please check the PIN.');
      }

      const gameData = snapshot.val() as Game;
      console.log(`✅ Game found: "${gameData.quiz?.title || 'Unknown'}" (Status: ${gameData.status})`);

      if (gameData.status !== 'waiting') {
        console.warn('⚠️ Game has already started');
        throw new Error('Game has already started. Cannot join now.');
      }

      // Check if player name already exists
      const existingNames = Object.values(gameData.players || {}).map(p => p.name.toLowerCase());
      if (existingNames.includes(playerName.toLowerCase())) {
        console.warn('⚠️ Player name already taken');
        throw new Error('This name is already taken. Please choose a different name.');
      }

      const playerId = generatePlayerId();
      console.log(`👤 Generated player ID: ${playerId}`);

      const playerData: Player = {
        name: playerName,
        score: 0,
        answers: {},
        joinedAt: Date.now()
      };

      console.log('🔥 Adding player to Firebase...');
      // Add player to game using Firebase directly
      const playerRef = ref(database, `games/${gamePin}/players/${playerId}`);
      await set(playerRef, playerData);

      console.log('✅ Player joined successfully');
      console.log(`🎮 Joining game interface for player "${playerName}"`);
      onJoinGame(gamePin, playerId, playerName);
    } catch (error) {
      console.error('❌ Error joining game:', error);
      setError(error instanceof Error ? error.message : 'Could not join game. Please check the game PIN.');
    }
    setJoining(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('⌨️ Enter key pressed, attempting to join game');
      joinGame();
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits, remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');

    // Limit to 6 digits maximum
    const limitedValue = numericValue.slice(0, 6);

    console.log(`🔢 PIN input changed: "${value}" -> "${limitedValue}" (${limitedValue.length}/6)`);
    setGamePin(limitedValue);

    // Clear error if user is typing a valid PIN
    if (error && limitedValue.length > 0) {
      setError('');
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }

    // Ensure that it's a number and stop the keypress if it's not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleNameChange = (value: string) => {
    // Trim whitespace and limit to 20 characters
    const trimmedValue = value.trim().slice(0, 20);
    console.log(`👤 Name input changed: "${trimmedValue}" (${trimmedValue.length}/20)`);
    setPlayerName(trimmedValue);

    // Clear error if user is typing a valid name
    if (error && trimmedValue.length > 0) {
      setError('');
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent leading spaces
    if (e.key === ' ' && playerName.length === 0) {
      e.preventDefault();
    }
  };

  const isValidPin = gamePin.length === 6 && /^\d{6}$/.test(gamePin);
  const isValidName = playerName.trim().length > 0;
  const canJoin = isValidPin && isValidName && !joining;

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#F0B7A4]/50">
          <h1 className="text-3xl font-bold text-center mb-8 text-[#305F72]">
            Join Game
          </h1>

          {error && (
            <div className="bg-[#F18C8E]/20 backdrop-blur-sm border border-[#F18C8E]/50 text-[#305F72] px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
              <FiAlertTriangle className="w-5 h-5 text-[#F18C8E] flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#305F72] mb-2">
                Game PIN
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={gamePin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyDown={handlePinKeyDown}
                onKeyPress={handleKeyPress}
                placeholder="Enter 6-digit PIN"
                className={`w-full p-4 bg-white/90 backdrop-blur-sm border rounded-xl text-center text-2xl font-mono text-[#305F72] placeholder-[#305F72]/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm ${gamePin.length === 0 ? 'border-[#F0B7A4]/50 focus:ring-[#568EA6]' :
                    isValidPin ? 'border-[#7FB069]/50 focus:ring-[#7FB069] bg-[#7FB069]/10' :
                      'border-[#F18C8E]/50 focus:ring-[#F18C8E] bg-[#F18C8E]/10'
                  }`}
                maxLength={6}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className={`text-xs mt-2 font-medium transition-colors ${gamePin.length === 0 ? 'text-[#305F72]/70' :
                  isValidPin ? 'text-[#7FB069]' :
                    'text-[#F18C8E]'
                }`}>
                {gamePin.length === 0 ? 'PIN should be 6 digits (e.g., 123456)' :
                  isValidPin ? '✓ Valid PIN format' :
                    `${gamePin.length}/6 digits - PIN must be exactly 6 digits`}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#305F72] mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className={`w-full p-4 bg-white/90 backdrop-blur-sm border rounded-xl text-[#305F72] placeholder-[#305F72]/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm ${playerName.length === 0 ? 'border-[#F0B7A4]/50 focus:ring-[#568EA6]' :
                    isValidName ? 'border-[#7FB069]/50 focus:ring-[#7FB069] bg-[#7FB069]/10' :
                      'border-[#F18C8E]/50 focus:ring-[#F18C8E] bg-[#F18C8E]/10'
                  }`}
                maxLength={20}
                autoComplete="off"
              />
              <div className={`text-xs mt-2 font-medium transition-colors ${playerName.length === 0 ? 'text-[#305F72]/70' :
                  isValidName ? 'text-[#7FB069]' :
                    'text-[#F18C8E]'
                }`}>
                {isValidName ? `✓ ${playerName.trim().length}/20 characters` : 'Maximum 20 characters, no leading spaces'}
              </div>
            </div>

            <button
              onClick={() => {
                console.log('🚀 User clicked "Join Game"');
                joinGame();
              }}
              disabled={!canJoin}
              className={`w-full py-4 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${canJoin
                  ? 'bg-[#568EA6] hover:bg-[#305F72] text-white hover:shadow-xl focus:ring-[#568EA6]'
                  : 'bg-[#305F72]/30 text-[#305F72]/50 cursor-not-allowed shadow-none'
                }`}
            >
              {joining ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Joining...
                </div>
              ) : (
                'Join Game'
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-[#F0B7A4]/20 backdrop-blur-sm rounded-xl border border-[#F0B7A4]/50 shadow-sm">
            <h3 className="font-semibold text-[#305F72] mb-3 flex items-center gap-2">
              <FiInfo className="w-5 h-5 text-[#568EA6]" />
              How to Join:
            </h3>
            <ol className="text-sm text-[#305F72]/80 space-y-2">
              <li className="flex items-start gap-3">
                <span className="bg-[#568EA6] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">1</span>
                <span className="font-medium">Get the 6-digit PIN from your host</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#568EA6] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">2</span>
                <span className="font-medium">Enter your name (up to 20 characters)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#568EA6] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">3</span>
                <span className="font-medium">Click "Join Game" to enter the waiting room</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#568EA6] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">4</span>
                <span className="font-medium">Wait for the host to start the game</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
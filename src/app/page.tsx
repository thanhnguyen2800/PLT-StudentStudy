'use client';

import { useState, useEffect, useCallback } from 'react';
import { Quiz } from './types/game';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { UserDashboard } from './components/UserDashboard';
import MainPage from './components/MainPage';
import HostDashboard from './components/HostDashboard';
import GameHost from './components/GameHost';
import PlayerJoin from './components/PlayerJoin';
import PlayerGame from './components/PlayerGame';
import SoloSetup from './components/SoloSetup';
import SoloGame from './components/SoloGame';
import { FiBookOpen, FiLogIn, FiWifiOff, FiCheckCircle, FiX, FiInfo, FiArrowLeft, FiLoader } from 'react-icons/fi';


type ViewType = 'menu' | 'dashboard' | 'host' | 'hostGame' | 'join' | 'playerGame' | 'solo' | 'soloGame';

interface GameState {
  gamePin: string;
  quiz: Quiz | null;
  playerId: string;
  playerName: string;
}

function StudentStudyApp() {
  // Core application state
  const [view, setView] = useState<ViewType>('menu');
  const [gameState, setGameState] = useState<GameState>({
    gamePin: '',
    quiz: null,
    playerId: '',
    playerName: ''
  });

  // Pre-loaded quiz state for hosting
  const [preloadedQuiz, setPreloadedQuiz] = useState<Quiz | null>(null);

  // Solo setup state
  const [soloPreloadedQuiz, setSoloPreloadedQuiz] = useState<Quiz | null>(null);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);

  // UI state
  const [isOnline, setIsOnline] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { user, loading, signOut } = useAuth();
  const appVersion = '2.1.0';

  // Initialize application
  useEffect(() => {
    console.log('📚 Student Study v' + appVersion + ' initialized');

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Authentication helper function
  const requireAuth = useCallback((action: () => void, message: string = 'Please sign in to access this feature') => {
    if (!user) {
      setAuthPromptMessage(message);
      setPendingAction(() => action);
      setShowAuthPage(true);
      return false;
    }
    return true;
  }, [user]);

  // Handle successful auth - watch for user changes
  useEffect(() => {
    if (user && pendingAction) {
      pendingAction();
      setPendingAction(null);
      setAuthPromptMessage('');
      setShowAuthPage(false);
    }
  }, [user, pendingAction]);

  // Game handlers
  const handleStartGame = useCallback((pin: string, quizData: Quiz) => {
    if (!pin || !quizData) return;
    console.log(`🎮 Host starting game with PIN: ${pin}`);
    setGameState({ gamePin: pin, quiz: quizData, playerId: '', playerName: '' });
    setView('hostGame');
  }, []);

  const handleJoinGame = useCallback((pin: string, id: string, name: string) => {
    if (!pin || !id || !name) return;
    console.log(`👤 Player "${name}" joining game ${pin}`);
    setGameState({ gamePin: pin, quiz: null, playerId: id, playerName: name });
    setView('playerGame');
  }, []);

  const handlePlayQuiz = useCallback((quiz: Quiz, mode: 'host' | 'solo') => {
    if (!quiz) return;
    if (mode === 'host') {
      console.log(`🎮 Host mode requested for quiz: "${quiz.title}"`);
      setPreloadedQuiz(quiz);
      setView('host');
    } else {
      console.log(`📚 Solo mode requested for quiz: "${quiz.title}"`);
      setGameState({ gamePin: '', quiz: quiz, playerId: '', playerName: '' });
      setView('soloGame');
    }
  }, []);

  const handleSoloSetup = useCallback((quiz?: Quiz) => {
    console.log('📚 Solo setup requested', quiz ? `with quiz: "${quiz.title}"` : 'without quiz');
    setSoloPreloadedQuiz(quiz || null);
    if (requireAuth(() => {
      console.log('🔄 Navigating to solo setup');
      setView('solo');
    }, 'Please sign in to access solo study mode')) {
      console.log('🔄 Navigating to solo setup');
      setView('solo');
    }
  }, [requireAuth]);

  const handleStartSolo = useCallback((quiz: Quiz, isFlashcardMode?: boolean) => {
    console.log(`📚 Starting solo study: "${quiz.title}" in ${isFlashcardMode ? 'flashcard' : 'quiz'} mode`);
    setGameState({ gamePin: '', quiz: quiz, playerId: '', playerName: '' });
    setIsFlashcardMode(isFlashcardMode || false);
    setView('soloGame');
  }, []);

  const handleSoloRestart = useCallback(() => {
    console.log('🔄 Restarting solo game - going back to setup');
    setSoloPreloadedQuiz(gameState.quiz);
    setView('solo');
  }, [gameState.quiz]);

  const resetToMenu = useCallback(() => {
    console.log('🏠 Returning to main menu');
    setView('menu');
    setGameState({ gamePin: '', quiz: null, playerId: '', playerName: '' });
    setPreloadedQuiz(null);
    setSoloPreloadedQuiz(null);
    setIsFlashcardMode(false);
  }, []);

  const handleMenuClick = useCallback(() => {
    if (user) {
      console.log('🏠 Returning to dashboard (user logged in)');
      navigateToView('dashboard');
    } else {
      console.log('🏠 Returning to main menu (no user)');
      resetToMenu();
    }
  }, [user, resetToMenu]);

  const navigateToView = useCallback((newView: ViewType) => {
    const authRequiredViews: ViewType[] = ['dashboard', 'host', 'solo'];
    if (authRequiredViews.includes(newView)) {
      const messages: Record<string, string> = {
        dashboard: 'Please sign in to access your dashboard',
        host: 'Please sign in to host a quiz game',
        solo: 'Please sign in to access solo study mode'
      };
      if (requireAuth(() => {
        console.log(`🔄 Navigating to: ${newView}`);
        if (newView === 'host') setPreloadedQuiz(null);
        if (newView === 'solo') setSoloPreloadedQuiz(null);
        setView(newView);
      }, messages[newView])) {
        console.log(`🔄 Navigating to: ${newView}`);
        if (newView === 'host') setPreloadedQuiz(null);
        if (newView === 'solo') setSoloPreloadedQuiz(null);
        setView(newView);
      }
    } else {
      console.log(`🔄 Navigating to: ${newView}`);
      setView(newView);
    }
  }, [requireAuth]);

  const handleHostGame = useCallback((quiz?: Quiz) => {
    console.log('🎮 Host game requested', quiz ? `with quiz: "${quiz.title}"` : 'without quiz');
    if (quiz) {
      console.log('🎯 Setting preloaded quiz:', quiz.title);
      setPreloadedQuiz(quiz);
    } else {
      console.log('🎯 Clearing preloaded quiz');
      setPreloadedQuiz(null);
    }
    if (requireAuth(() => {
      console.log('🔄 Navigating to host view');
      setView('host');
    }, 'Please sign in to host a quiz game')) {
      console.log('🔄 Navigating to host view');
      setView('host');
    }
  }, [requireAuth]);

  // Update document title
  useEffect(() => {
    const titles: Record<ViewType, string> = {
      menu: 'Student Study - Interactive Learning Platform',
      dashboard: 'Student Study - My Dashboard',
      host: 'Student Study - Host Game',
      hostGame: `Student Study - Hosting ${gameState.gamePin}`,
      join: 'Student Study - Join Game',
      playerGame: `Student Study - Playing as ${gameState.playerName}`,
      solo: 'Student Study - Solo Study',
      soloGame: `Student Study - Studying ${gameState.quiz?.title || 'Quiz'}`
    };
    document.title = titles[view];
  }, [view, gameState]);

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-16 h-16 text-[#568EA6] animate-spin mb-4 mx-auto" />
          <p className="text-[#305F72] text-lg font-medium">Loading Student Study...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#305F72] relative overflow-hidden">
      {/* Email Verification Banner */}
      {user && <EmailVerificationBanner user={user} />}

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#F0F4F8]/80 backdrop-blur-sm border-b border-[#F0B7A4]/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleMenuClick}
              className="flex items-center gap-3 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#568EA6] focus:ring-offset-2 rounded-lg p-1"
            >
              <FiBookOpen className="h-7 w-7 text-[#568EA6]" />
              <h1 className="text-xl font-bold">
                Student <span className="text-[#568EA6]">Study</span>
              </h1>
            </button>
            <div className="flex items-center gap-4">
              {user ? (
                <UserProfile
                  user={user}
                  onSignOut={signOut}
                  onViewDashboard={() => navigateToView('dashboard')}
                />
              ) : (
                <button
                  onClick={() => setShowAuthPage(true)}
                  className="flex items-center gap-2 bg-[#568EA6] hover:bg-[#305F72] text-white px-5 py-2 rounded-lg font-semibold shadow-md border border-[#305F72]/30 focus:outline-none focus:ring-2 focus:ring-[#568EA6] focus:ring-offset-2 transition-colors"
                >
                  <FiLogIn />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 bg-[#F18C8E] text-white text-center py-2 z-50 text-sm font-medium flex items-center justify-center gap-2">
          <FiWifiOff /> You're offline. Some features may not work properly.
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-[#568EA6] text-white px-6 py-3 rounded-lg shadow-xl border border-[#305F72]/50 flex items-center gap-3 max-w-sm">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-white/70 hover:text-white focus:outline-none"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content with top padding for fixed nav */}
      <div className="pt-16">
        {view === 'menu' && <MainPage onShowAuth={() => setShowAuthPage(true)} user={user} onNavigate={navigateToView} />}
        {view === 'dashboard' && <UserDashboard onBack={resetToMenu} onPlayQuiz={handlePlayQuiz} onHostGame={handleHostGame} onJoinGame={() => navigateToView('join')} onSoloSetup={handleSoloSetup} showToastMessage={showToastMessage} />}
        {view === 'host' && <HostDashboard onStartGame={handleStartGame} preloadedQuiz={preloadedQuiz} onBack={() => navigateToView('dashboard')} />}
        {view === 'solo' && <SoloSetup onStartSolo={handleStartSolo} preloadedQuiz={soloPreloadedQuiz} />}
        {view === 'join' && <PlayerJoin onJoinGame={handleJoinGame} />}

        {/* Game Views with Menu Button */}
        {(view === 'hostGame' || view === 'soloGame' || view === 'playerGame') && (
          <div>
            <button
              onClick={handleMenuClick}
              className="fixed top-20 left-4 bg-[#F0B7A4]/80 hover:bg-[#F0B7A4] backdrop-blur-sm text-[#305F72] px-4 py-2 rounded-lg transition-all duration-200 z-40 shadow-md border border-[#305F72]/20 font-medium focus:outline-none focus:ring-2 focus:ring-[#305F72] focus:ring-offset-2 flex items-center gap-2"
            >
              <FiArrowLeft />
              Menu
            </button>
            {view === 'hostGame' && gameState.quiz && <GameHost gamePin={gameState.gamePin} quiz={gameState.quiz} />}
            {view === 'soloGame' && gameState.quiz && <SoloGame quiz={gameState.quiz} isFlashcardMode={isFlashcardMode} onRestart={handleSoloRestart} />}
            {view === 'playerGame' && <PlayerGame gamePin={gameState.gamePin} playerId={gameState.playerId} playerName={gameState.playerName} />}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F0F4F8] rounded-2xl shadow-2xl max-w-md w-full relative border border-[#F0B7A4]">
            {authPromptMessage && (
              <div className="bg-[#F0B7A4] border-l-4 border-[#568EA6] p-4 rounded-t-xl">
                <div className="flex items-center">
                  <FiInfo className="w-6 h-6 text-[#568EA6] mr-3 flex-shrink-0" />
                  <p className="text-[#305F72] font-medium">{authPromptMessage}</p>
                </div>
              </div>
            )}
            <AuthPage
              onClose={() => {
                setShowAuthPage(false);
                setAuthPromptMessage('');
                setPendingAction(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Version Info */}
      <div className="fixed bottom-4 right-4 text-xs text-[#305F72] bg-[#F0F4F8]/70 px-3 py-2 rounded-lg backdrop-blur-sm border border-[#F0B7A4]">
        v{appVersion}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudentStudyApp />
    </AuthProvider>
  );
}
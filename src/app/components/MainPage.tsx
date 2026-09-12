import React from 'react';
import { FaUsers, FaBook, FaBolt, FaChartLine, FaGamepad, FaClock, FaTrophy, FaBrain, FaRocket, FaHeart } from 'react-icons/fa';

// Update this to match your main app's ViewType
type ViewType = 'menu' | 'dashboard' | 'host' | 'hostGame' | 'join' | 'playerGame' | 'solo' | 'soloGame';

interface MainPageProps {
  onShowAuth: () => void;
  user: any;
  onNavigate: (view: ViewType) => void;
}

export default function MainPage({ onShowAuth, user, onNavigate }: MainPageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F8' }}>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border mb-8">
            <FaRocket style={{ color: '#568EA6' }} />
            <span className="font-semibold" style={{ color: '#305F72' }}>The Future of Interactive Learning</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ color: '#305F72' }}>
            Student <span style={{ color: '#568EA6' }}>Study</span>
          </h1>

          <p className="text-xl sm:text-2xl mb-4 max-w-3xl mx-auto" style={{ color: '#305F72' }}>
            Where <span className="font-semibold" style={{ color: '#568EA6' }}>Kahoot's</span> live multiplayer excitement meets <span className="font-semibold" style={{ color: '#F18C8E' }}>Quizlet's</span> study power
          </p>

          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
            Create AI-powered quizzes, host live competitions, and master any subject with our hybrid learning platform
          </p>

          {!user ? (
            <button
              onClick={onShowAuth}
              className="text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#568EA6' }}
            >
              Get Started Free
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#568EA6' }}
            >
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Platform Comparison */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-2xl border text-center shadow-lg">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
              <FaGamepad className="text-2xl" style={{ color: '#305F72' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#305F72' }}>Like Kahoot</h3>
            <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>Live multiplayer games with real-time competition and leaderboards</p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#568EA6' }}>
              <FaBolt />
              <span>Real-time excitement</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border text-center shadow-lg">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
              <FaHeart className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#305F72' }}>Student Study</h3>
            <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>The best of both worlds combined with AI-powered quiz creation</p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#F18C8E' }}>
              <FaRocket />
              <span>Perfect hybrid</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border text-center shadow-lg">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
              <FaBook className="text-2xl" style={{ color: '#305F72' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#305F72' }}>Like Quizlet</h3>
            <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>Personal study modes with progress tracking and spaced repetition</p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#568EA6' }}>
              <FaBrain />
              <span>Deep learning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#305F72' }}>Powerful Features for Every Learning Style</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
              Whether you're hosting a classroom competition or studying solo, Student Study adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
                <FaBolt className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>AI Quiz Generation</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Generate professional quizzes instantly from any topic with advanced AI assistance</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#568EA6' }}>
                <FaUsers className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Live Multiplayer</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Host real-time quiz competitions with up to 100 players simultaneously</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
                <FaBook className="text-xl" style={{ color: '#305F72' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Solo Study Mode</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Practice privately with personalized feedback and adaptive learning</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
                <FaChartLine className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Progress Analytics</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Track learning progress with detailed insights and performance metrics</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#568EA6' }}>
                <FaClock className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Timed Challenges</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Customizable time limits add pressure and excitement to learning</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
                <FaTrophy className="text-xl" style={{ color: '#305F72' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Live Leaderboards</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Real-time rankings and achievements motivate healthy competition</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
                <FaGamepad className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Instant Feedback</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Get immediate results and explanations to reinforce learning</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#568EA6' }}>
                <FaBrain className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Smart Adaptation</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>AI adjusts difficulty based on performance for optimal learning</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-8" style={{ backgroundColor: '#F0B7A4' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#305F72' }}>How Student Study Works</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
              From creation to competition in three simple steps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: '#568EA6' }}>
                1
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Create with AI</h3>
              <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Simply describe your topic to our AI, and get a professional quiz in seconds. Or use our manual editor for complete control.
              </p>
              <div className="p-4 rounded-xl bg-white border">
                <p className="text-sm font-mono" style={{ color: '#568EA6' }}>
                  "Create a 15-question quiz about World War II for high school students"
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: '#F18C8E' }}>
                2
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Choose Your Mode</h3>
              <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Host a live multiplayer game for groups, or study solo at your own pace with personalized feedback.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center bg-white border" style={{ borderColor: '#568EA6' }}>
                  <FaUsers className="mx-auto mb-2" style={{ color: '#568EA6' }} />
                  <p className="text-xs font-semibold" style={{ color: '#305F72' }}>Host Game</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-white border" style={{ borderColor: '#F18C8E' }}>
                  <FaBook className="mx-auto mb-2" style={{ color: '#F18C8E' }} />
                  <p className="text-xs font-semibold" style={{ color: '#305F72' }}>Solo Study</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: '#305F72' }}>
                3
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Learn & Compete</h3>
              <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Engage with real-time questions, see live results, and track your progress over time.
              </p>
              <div className="p-4 rounded-xl bg-white border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: '#305F72' }}>Your Rank: #1</span>
                  <span className="text-sm font-bold" style={{ color: '#568EA6' }}>850 pts</span>
                </div>
                <div className="rounded-full h-2" style={{ backgroundColor: '#F0B7A4' }}>
                  <div className="h-2 rounded-full w-4/5" style={{ backgroundColor: '#F18C8E' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-8 text-white" style={{ backgroundColor: '#568EA6' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ opacity: 0.9 }}>
            Join thousands of educators and students who are making learning more engaging with Student Study
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <button
                  onClick={onShowAuth}
                  className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#F18C8E', color: '#305F72' }}
                >
                  Start Creating Quizzes
                </button>
                <button
                  onClick={() => onNavigate('join')}
                  className="text-white border px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                  style={{ borderColor: '#F0B7A4', backgroundColor: '#305F72' }}
                >
                  Join a Game
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#F18C8E', color: '#305F72' }}
              >
                Go to Your Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 text-white" style={{ backgroundColor: '#305F72' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">
              Student <span style={{ color: '#F18C8E' }}>Study</span>
            </h3>
            <p style={{ color: '#F0B7A4' }}>Where learning meets excitement</p>
          </div>

          <div className="border-t pt-8" style={{ borderColor: '#568EA6' }}>
            <p style={{ color: '#F0B7A4' }}>
              &copy; 2024 Student Study. Empowering learners worldwide with interactive quiz experiences.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
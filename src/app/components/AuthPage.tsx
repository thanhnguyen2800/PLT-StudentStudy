'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { FiX, FiLoader, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export function AuthPage({ onClose }: { onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signUp(email, password);
        setSuccess('Account created! Please check your email for verification.');
      } else {
        await signIn(email, password);
        setSuccess('Signed in successfully!');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#305F72]">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <button
          onClick={onClose}
          className="text-[#305F72]/60 hover:text-[#305F72] transition-colors focus:outline-none focus:ring-2 focus:ring-[#568EA6] focus:ring-offset-2 rounded-lg p-1"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#305F72] mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/80 border border-[#F0B7A4]/50 rounded-lg px-4 py-3 text-[#305F72] placeholder-[#305F72]/50 focus:border-[#568EA6] focus:ring-2 focus:ring-[#568EA6]/50 outline-none transition-all backdrop-blur-sm shadow-sm"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#305F72] mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/80 border border-[#F0B7A4]/50 rounded-lg px-4 py-3 text-[#305F72] placeholder-[#305F72]/50 focus:border-[#568EA6] focus:ring-2 focus:ring-[#568EA6]/50 outline-none transition-all backdrop-blur-sm shadow-sm"
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-[#305F72] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/80 border border-[#F0B7A4]/50 rounded-lg px-4 py-3 text-[#305F72] placeholder-[#305F72]/50 focus:border-[#568EA6] focus:ring-2 focus:ring-[#568EA6]/50 outline-none transition-all backdrop-blur-sm shadow-sm"
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>
        )}

        {error && (
          <div className="bg-[#F18C8E]/20 border-l-4 border-[#F18C8E] p-3 rounded-lg text-[#305F72] text-sm flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-[#F18C8E]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#568EA6]/20 border-l-4 border-[#568EA6] p-3 rounded-lg text-[#305F72] text-sm flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-[#568EA6]" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#568EA6] hover:bg-[#305F72] disabled:bg-[#305F72]/50 text-white py-3 px-4 rounded-lg font-semibold shadow-md border border-[#305F72]/30 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#568EA6] focus:ring-offset-2"
        >
          {isLoading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[#305F72]/70 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </p>
        <button
          onClick={toggleMode}
          className="text-[#568EA6] hover:text-[#305F72] font-medium text-sm mt-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#568EA6] focus:ring-offset-2 rounded px-1"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>

      {!isSignUp && (
        <div className="mt-4 p-4 bg-[#F0B7A4]/30 border border-[#F0B7A4]/50 rounded-lg">
          <p className="text-[#305F72] text-sm font-medium mb-2">Demo Account:</p>
          <p className="text-[#305F72]/80 text-xs">
            Email: demo@example.com<br />
            Password: password
          </p>
        </div>
      )}
    </div>
  );
}
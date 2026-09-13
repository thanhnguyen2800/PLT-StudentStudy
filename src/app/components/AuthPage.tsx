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
          throw new Error('Mật khẩu không khớp');
        }
        if (password.length < 6) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
        }
        await signUp(email, password);
        setSuccess('Đã tạo tài khoản! Vui lòng kiểm tra email để xác minh.');
      } else {
        await signIn(email, password);
        setSuccess('Đăng nhập thành công!');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
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
          {isSignUp ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
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
            Địa chỉ email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/80 border border-[#F0B7A4]/50 rounded-lg px-4 py-3 text-[#305F72] placeholder-[#305F72]/50 focus:border-[#568EA6] focus:ring-2 focus:ring-[#568EA6]/50 outline-none transition-all backdrop-blur-sm shadow-sm"
            placeholder="Nhập email của bạn"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#305F72] mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/80 border border-[#F0B7A4]/50 rounded-lg px-4 py-3 text-[#305F72] placeholder-[#305F72]/50 focus:border-[#568EA6] focus:ring-2 focus:ring-[#568EA6]/50 outline-none transition-all backdrop-blur-sm shadow-sm"
            placeholder="Nhập mật khẩu của bạn"
            required
            minLength={6}
          />
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-[#305F72] mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/80 border border-[#F0B7A4]/50 rounded-lg px-4 py-3 text-[#305F72] placeholder-[#305F72]/50 focus:border-[#568EA6] focus:ring-2 focus:ring-[#568EA6]/50 outline-none transition-all backdrop-blur-sm shadow-sm"
              placeholder="Nhập lại mật khẩu"
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
              {isSignUp ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...'}
            </>
          ) : (
            isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'
          )}
        </button>
      </form>

      {!isSignUp && (
        <div className="mt-4 p-4 bg-[#F0B7A4]/30 border border-[#F0B7A4]/50 rounded-lg">
          <p className="text-[#305F72] text-sm font-medium mb-2">Tài khoản Demo:</p>
          <p className="text-[#305F72]/80 text-xs">
            Email: demo@example.com<br />
            Password: password
          </p>
        </div>
      )}
    </div>
  );
}
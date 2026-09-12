'use client';

import { useState } from 'react';
import { sendEmailVerification, User } from 'firebase/auth';

export function EmailVerificationBanner({ user }: { user: User }) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const resendVerification = async () => {
    setIsResending(true);
    try {
      console.log('📧 Resending email verification to:', user.email);
      await sendEmailVerification(user);
      setMessage('Verification email sent!');
      console.log('✅ Email verification sent successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error.message);
      setMessage('Failed to send email. Try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsResending(false);
    }
  };

  if (user?.emailVerified) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white text-center py-3 z-40">
      <div className="flex items-center justify-center gap-4 px-4">
        <span className="text-sm font-medium">
          ⚠️ Please verify your email address to access all features
        </span>
        <button
          onClick={resendVerification}
          disabled={isResending}
          className="bg-orange-700 hover:bg-orange-800 disabled:bg-orange-800 px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          {isResending ? 'Sending...' : 'Resend Email'}
        </button>
      </div>
      {message && (
        <div className="text-xs mt-1 font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
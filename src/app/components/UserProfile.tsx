'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { FiChevronDown, FiCheckCircle, FiAlertTriangle, FiGrid, FiLogOut } from 'react-icons/fi';

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
  onViewDashboard: () => void;
}

export function UserProfile({ user, onSignOut, onViewDashboard }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDashboard = () => {
    onViewDashboard();
    setIsOpen(false);
  };

  const handleSignOut = () => {
    onSignOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-[#F0B7A4]/80 hover:bg-[#F0B7A4] backdrop-blur-sm text-[#305F72] px-4 py-2 rounded-lg transition-all duration-200 border border-[#305F72]/20 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#305F72] focus:ring-offset-2"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-[#568EA6] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block text-sm font-medium max-w-32 truncate">
          {user.email}
        </span>
        <FiChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-[#F0F4F8]/95 backdrop-blur-md border border-[#F0B7A4]/50 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-[#F0B7A4]/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#568EA6] rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#305F72] font-semibold text-sm truncate">{user.email}</p>
                  <p className="text-[#305F72] text-xs mt-1">
                    {user.emailVerified ? (
                      <span className="text-[#568EA6] flex items-center gap-1.5 font-medium">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Verified Account
                      </span>
                    ) : (
                      <span className="text-[#F18C8E] flex items-center gap-1.5 font-medium">
                        <FiAlertTriangle className="w-3.5 h-3.5" />
                        Needs Verification
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleDashboard}
                className="w-full text-left px-3 py-3 text-[#305F72] hover:bg-[#F0B7A4] hover:text-[#305F72] rounded-lg transition-all duration-200 flex items-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#568EA6]"
              >
                <div className="w-8 h-8 bg-[#568EA6]/20 rounded-lg flex items-center justify-center">
                  <FiGrid className="w-4 h-4 text-[#568EA6]" />
                </div>
                <span>My Dashboard</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-3 text-[#305F72] hover:bg-[#F18C8E]/50 hover:text-[#305F72] rounded-lg transition-all duration-200 flex items-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#F18C8E]"
              >
                <div className="w-8 h-8 bg-[#F18C8E]/30 rounded-lg flex items-center justify-center">
                  <FiLogOut className="w-4 h-4 text-[#F18C8E]" />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
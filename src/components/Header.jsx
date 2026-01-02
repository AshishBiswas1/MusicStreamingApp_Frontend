import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';

const Header = ({ searchQuery, setSearchQuery, onSettingsClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const getProfileImage = () => {
    if (user?.profile) {
      return user.profile;
    }
    // Default SVG avatar
    return null;
  };

  return (
    <>
      <header className="bg-gradient-to-r from-[#1a1a1a]/80 via-[#1f1f1f]/80 to-[#1a1a1a]/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 flex items-center justify-between shadow-lg">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors z-10" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-gray-900/70 transition-all duration-300 shadow-inner"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 ml-6">
          <button
            onClick={onSettingsClick}
            className="p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 border border-gray-700/50 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-500/10">
              {getProfileImage() ? (
                <img
                  src={getProfileImage()}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <span className="font-medium text-white hidden sm:inline max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 rounded-xl transition-all duration-300 group shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
            >
              <UserCircleIcon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-white hidden sm:inline">
                Login
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {/* Signup Modal */}
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
};

export default Header;

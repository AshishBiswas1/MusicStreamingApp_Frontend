import React from 'react';
import {
  HomeIcon,
  MusicalNoteIcon,
  QueueListIcon,
  HeartIcon,
  ClockIcon,
  SparklesIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ selectedCategory, setSelectedCategory }) => {
  const categories = [
    { name: 'All', icon: HomeIcon },
    { name: 'Recommended', icon: SparklesIcon },
    { name: 'Podcasts', icon: MicrophoneIcon }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] backdrop-blur-md p-6 flex flex-col border-r border-gray-800/50 shadow-2xl">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <MusicalNoteIcon className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,217,255,0.5)] transition-all group-hover:drop-shadow-[0_0_20px_rgba(0,217,255,0.8)]" />
            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent neon-text">
            StreamVibe
          </h1>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-13 tracking-wider uppercase">
          Premium Audio
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Browse
        </h2>
        <ul className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.name}>
                <button
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20 border border-cyan-500/30'
                      : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  {selectedCategory === category.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-shimmer"></div>
                  )}
                  <Icon
                    className={`w-5 h-5 z-10 transition-all ${
                      selectedCategory === category.name
                        ? 'drop-shadow-[0_0_5px_rgba(0,217,255,0.5)]'
                        : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium z-10">{category.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Playlists */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Your Library
          </h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedCategory('Liked Songs')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white transition-all duration-300 group border border-transparent hover:border-gray-700/50"
              >
                <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Liked Songs</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white transition-all duration-300 group border border-transparent hover:border-gray-700/50">
                <QueueListIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Playlists</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-800/50">
        <p className="text-xs text-gray-600 text-center tracking-wide">
          © 2025 StreamVibe
        </p>
        <p className="text-[10px] text-gray-700 text-center mt-1">
          Powered by Modern UI
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

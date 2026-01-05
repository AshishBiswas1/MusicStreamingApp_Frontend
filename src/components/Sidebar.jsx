import React, { useState } from 'react';
import {
  HomeIcon,
  MusicalNoteIcon,
  QueueListIcon,
  HeartIcon,
  ClockIcon,
  SparklesIcon,
  BookmarkIcon,
  MicrophoneIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ selectedCategory, setSelectedCategory }) => {
  const [songsOpen, setSongsOpen] = useState(true);
  const [podcastsOpen, setPodcastsOpen] = useState(false);
  const categories = [
    { name: 'All', icon: HomeIcon },
    { name: 'Recommended', icon: SparklesIcon },
    { name: 'Podcasts', icon: MicrophoneIcon }
  ];

  return (
    <div className="w-96 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] backdrop-blur-md p-6 flex flex-col border-r border-gray-800/50 shadow-2xl">
      {/* Logo */}
      <div className="mb-6">
        <div className="flex items-center gap-2 group">
          <div className="relative">
            <MusicalNoteIcon className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,217,255,0.5)] transition-all group-hover:drop-shadow-[0_0_20px_rgba(0,217,255,0.8)]" />
            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent neon-text">
            StreamVibe
          </h1>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 ml-10 tracking-wider uppercase">
          Premium Audio
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pb-[500px]">
        <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Browse
        </h2>

        {/* Songs Dropdown */}
        <div className="mb-3">
          <button
            onClick={() => setSongsOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white transition-all duration-300 group border border-transparent hover:border-gray-700/50"
          >
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4" />
              <span className="font-medium">Songs</span>
            </div>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                songsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {songsOpen && (
            <ul className="mt-2 space-y-1.5 pl-2">
              <li>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                    selectedCategory === 'All'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                      : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                  }`}
                >
                  <HomeIcon className="w-4 h-4 z-10" />
                  <span className="font-medium z-10">All Songs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('Recommended')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                    selectedCategory === 'Recommended'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                      : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4 z-10" />
                  <span className="font-medium z-10">Recommended</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('History')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                    selectedCategory === 'History'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                      : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                  }`}
                >
                  <ClockIcon className="w-4 h-4 z-10" />
                  <span className="font-medium z-10">History</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('Playlists')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                    selectedCategory === 'Playlists'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                      : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                  }`}
                >
                  <QueueListIcon className="w-4 h-4 z-10" />
                  <span className="font-medium z-10">Playlists</span>
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* Your Library - Liked / Playlists / Podcasts */}
        <div className="mt-4">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Your Library
          </h2>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => setSelectedCategory('Liked Songs')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white transition-all duration-300 group border border-transparent hover:border-gray-700/50"
              >
                <HeartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Liked Songs</span>
              </button>
            </li>
          </ul>

          {/* Podcasts Dropdown */}
          <div className="mt-3">
            <button
              onClick={() => setPodcastsOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white transition-all duration-300 group border border-transparent hover:border-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <MicrophoneIcon className="w-4 h-4" />
                <span className="font-medium">Podcasts</span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  podcastsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {podcastsOpen && (
              <ul className="mt-2 space-y-1.5 pl-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory('Podcasts')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      selectedCategory === 'Podcasts'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                        : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                    }`}
                  >
                    <MicrophoneIcon className="w-4 h-4 z-10" />
                    <span className="font-medium z-10">All Podcasts</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedCategory('PodcastHistory')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      selectedCategory === 'PodcastHistory'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                        : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                    }`}
                  >
                    <ClockIcon className="w-4 h-4 z-10" />
                    <span className="font-medium z-10">Podcast History</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedCategory('PodcastRecently')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      selectedCategory === 'PodcastRecently'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                        : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                    }`}
                  >
                    <ClockIcon className="w-4 h-4 z-10" />
                    <span className="font-medium z-10">Recently Played</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedCategory('PodcastSaved')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      selectedCategory === 'PodcastSaved'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg'
                        : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white'
                    }`}
                  >
                    <BookmarkIcon className="w-4 h-4 z-10" />
                    <span className="font-medium z-10">Saved Podcasts</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-gray-800/50">
        <p className="text-[10px] text-gray-600 text-center tracking-wide">
          © 2025 StreamVibe
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

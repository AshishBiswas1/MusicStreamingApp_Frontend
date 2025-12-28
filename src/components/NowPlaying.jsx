import React from 'react';
import {
  XMarkIcon,
  ClockIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

const NowPlaying = ({ currentSong, onClose }) => {
  return (
    <div className="w-96 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] backdrop-blur-md border-l border-gray-800/50 p-6 overflow-y-auto animate-slide-up shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Now Playing
          </h2>
          <p className="text-xs text-gray-500 mt-1">Current Track Details</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800/50 rounded-lg transition-all border border-transparent hover:border-gray-700/50 group"
        >
          <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      {/* Album Art */}
      <div className="mb-6 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-glow"></div>
        <img
          src={currentSong.image}
          alt={currentSong.song}
          className="relative w-full aspect-square rounded-2xl shadow-2xl border-2 border-cyan-500/20"
        />
      </div>

      {/* Song Details */}
      <div className="space-y-6">
        <div className="text-center pb-6 border-b border-gray-800/50">
          <h3 className="text-2xl font-bold mb-2 text-white">
            {currentSong.song}
          </h3>
          <p className="text-cyan-400 font-medium">
            {currentSong.music || 'Unknown Artist'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4 rounded-xl border border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Year
              </p>
            </div>
            <p className="font-bold text-lg text-white">{currentSong.year}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4 rounded-xl border border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <MusicalNoteIcon className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Duration
              </p>
            </div>
            <p className="font-bold text-lg text-white">
              {Math.floor(currentSong.duration / 60)}:
              {(currentSong.duration % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4 rounded-xl border border-gray-800/50">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Label
          </p>
          <p className="font-medium text-white">{currentSong.label}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4 rounded-xl border border-gray-800/50">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Copyright
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {currentSong.copyright_text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;

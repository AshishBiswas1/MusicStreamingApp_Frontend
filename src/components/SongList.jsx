import React from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

const SongList = ({ songs, currentSong, playSong, isPlaying }) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Discover Music
        </h2>
        <p className="text-gray-500 text-sm">Explore your favorite tracks</p>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700/50">
              <MusicalNoteIcon className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <p className="text-xl font-medium">No songs found</p>
          <p className="text-sm text-gray-600 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {songs.map((song, index) => {
            const isCurrentSong = currentSong?.media_url === song.media_url;

            return (
              <div
                key={index}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isCurrentSong
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/20 border border-cyan-500/30'
                    : 'bg-gradient-to-r from-gray-900/30 to-gray-800/30 hover:from-gray-800/50 hover:to-gray-700/50 border border-gray-800/50 hover:border-gray-700/50 hover:shadow-lg'
                }`}
                onClick={() => playSong(song)}
              >
                {/* Animated background for current song */}
                {isCurrentSong && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-shimmer"></div>
                )}

                {/* Album Art */}
                <div className="relative flex-shrink-0 z-10">
                  <div
                    className={`absolute -inset-1 rounded-xl blur-md transition-opacity duration-300 ${
                      isCurrentSong
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-30'
                    }`}
                  ></div>
                  <img
                    src={song.image}
                    alt={song.song}
                    className="relative w-16 h-16 rounded-lg object-cover shadow-xl"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg transition-all duration-300 ${
                      isCurrentSong
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isCurrentSong && isPlaying ? (
                      <PauseIcon className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,217,255,0.8)]" />
                    ) : (
                      <PlayIcon className="w-7 h-7 text-white drop-shadow-lg" />
                    )}
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0 z-10">
                  <h3
                    className={`font-semibold truncate transition-colors ${
                      isCurrentSong
                        ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,217,255,0.5)]'
                        : 'text-white group-hover:text-cyan-300'
                    }`}
                  >
                    {song.song}
                  </h3>
                  <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                    {song.music || 'Unknown Artist'}
                  </p>
                </div>

                {/* Duration & Year */}
                <div className="flex items-center gap-6 text-sm text-gray-500 z-10">
                  <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <ClockIcon className="w-4 h-4" />
                    {song.year}
                  </span>
                  <span className="font-medium text-gray-400 tabular-nums">
                    {formatDuration(parseInt(song.duration))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongList;

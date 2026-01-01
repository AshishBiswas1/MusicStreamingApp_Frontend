import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/config';
import { PlayIcon, PauseIcon, ClockIcon } from '@heroicons/react/24/solid';

const History = ({ currentSong, playSong, isPlaying }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view your listening history');
      }

      const response = await fetch(API_ENDPOINTS.recentlyPlayed.getMusic(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again');
        }
        throw new Error('Failed to fetch history');
      }

      const result = await response.json();

      // Extract songs from the response structure
      const songs = result.data
        .map((item) => ({
          ...item.song_id,
          played_at: item.played_at,
          history_id: item.id
        }))
        .filter((song) => song.id); // Filter out any null songs

      setHistoryData(songs);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-gray-400">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-32">
      {/* Header */}
      <div className="pt-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Listening History
            </h1>
            <p className="text-gray-400 mt-1">
              {historyData.length} {historyData.length === 1 ? 'song' : 'songs'}{' '}
              played
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && historyData.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No listening history yet
          </h3>
          <p className="text-gray-500">Songs you play will appear here</p>
        </div>
      )}

      {/* History Grid */}
      {historyData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {historyData.map((song) => {
            const isCurrentSong = currentSong && currentSong.id === song.id;

            return (
              <div
                key={song.history_id}
                className={`group relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isCurrentSong
                    ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/50'
                    : ''
                }`}
                onClick={() => playSong(song)}
              >
                {/* Album Art */}
                <div className="relative aspect-square">
                  <img
                    src={song.image}
                    alt={song.song}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />

                  {/* Play Button Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                      isCurrentSong
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <button className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center transform transition-transform hover:scale-110 shadow-lg">
                      {isCurrentSong && isPlaying ? (
                        <PauseIcon className="w-6 h-6 text-white" />
                      ) : (
                        <PlayIcon className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Current Playing Indicator */}
                  {isCurrentSong && isPlaying && (
                    <div className="absolute top-2 right-2 flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-cyan-400 rounded-full animate-pulse"
                          style={{
                            height: '16px',
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '1s'
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Played Time Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-gray-300">
                    {formatDateTime(song.played_at)}
                  </div>
                </div>

                {/* Song Info */}
                <div className="p-3">
                  <h3
                    className={`font-semibold text-sm truncate mb-1 ${
                      isCurrentSong ? 'text-cyan-400' : 'text-white'
                    }`}
                  >
                    {song.song}
                  </h3>
                  <p className="text-xs text-gray-400 truncate mb-2">
                    {song.music || 'Unknown Artist'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{song.year || '----'}</span>
                    <span>{formatDuration(song.duration)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;

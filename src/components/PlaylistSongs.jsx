import React, { useState, useEffect } from 'react';
import { playlistService } from '../api/playlistService';
import { ArrowLeftIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

const PlaylistSongs = ({
  playlistId,
  playlistName,
  onBack,
  currentSong,
  playSong,
  isPlaying
}) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistSongs();
    }
  }, [playlistId]);

  const fetchPlaylistSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playlistService.getPlaylistSongs(playlistId);
      setSongs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch playlist songs');
    } finally {
      setLoading(false);
    }
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
            <p className="text-gray-400">Loading songs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-32">
      {/* Header */}
      <div className="pt-6 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Playlists</span>
        </button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          {playlistName}
        </h1>
        <p className="text-gray-400">
          {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && songs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No songs in this playlist yet
          </h3>
          <p className="text-gray-500">
            Add songs to this playlist to start listening
          </p>
        </div>
      )}

      {/* Songs Grid */}
      {songs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song) => {
            const isCurrentSong = currentSong && currentSong.id === song.id;

            return (
              <div
                key={song.playlist_song_id}
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

export default PlaylistSongs;

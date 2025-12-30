import React, { useEffect, useState } from 'react';
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/react/24/solid';
import { musicService } from '../api/musicService';

const LikedSongs = ({ currentSong, playSong, isPlaying }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        const songs = await musicService.getLikedSongs();
        setLikedSongs(songs);
      } catch (err) {
        setError(err.message || 'Failed to fetch liked songs');
        console.error('Error loading liked songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-gray-400">Loading liked songs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (likedSongs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HeartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No liked songs yet</p>
          <p className="text-gray-500 text-sm">
            Start liking songs to build your collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-red-400 via-pink-400 to-red-500 bg-clip-text text-transparent">
          Liked Songs
        </h2>
        <p className="text-gray-500 text-sm">
          {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {likedSongs.map((song, index) => {
          const isCurrentSong =
            currentSong && currentSong.media_url === song.media_url;
          return (
            <div
              key={song.id || index}
              className={`w-[200px] group relative bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-lg overflow-hidden border border-gray-700/20 cursor-pointer hover:border-cyan-500/30 transition-all ${
                isCurrentSong ? 'ring-2 ring-cyan-500/50' : ''
              }`}
              onClick={() => playSong(song)}
            >
              {isCurrentSong && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-shimmer"></div>
              )}

              <div className="relative w-full aspect-square bg-gray-900/10 flex items-center justify-center overflow-hidden">
                <img
                  src={song.image}
                  alt={song.song}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/400x400?text=Song';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSong(song);
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  {isCurrentSong && isPlaying ? (
                    <PauseIcon className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <PlayIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              <div className="p-3">
                <div
                  className={`font-medium text-sm text-white mb-1 overflow-hidden text-ellipsis whitespace-nowrap ${
                    isCurrentSong ? 'text-cyan-400' : ''
                  }`}
                  title={song.song}
                >
                  {song.song}
                </div>
                <div
                  className="text-xs text-gray-400 mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={song.music || 'Unknown Artist'}
                >
                  {song.music || 'Unknown Artist'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {song.year && <span>{song.year}</span>}
                  {song.duration && (
                    <>
                      {song.year && <span>•</span>}
                      <span>{formatDuration(parseInt(song.duration))}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LikedSongs;

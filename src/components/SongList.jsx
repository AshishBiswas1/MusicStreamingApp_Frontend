import React, { useEffect, useState } from 'react';
import { PlayIcon, PauseIcon, PlusIcon } from '@heroicons/react/24/solid';
import { recentlyPlayedService } from '../api/musicService';
import AddToPlaylistModal from './AddToPlaylistModal';

const SongList = ({
  songs,
  currentSong,
  playSong,
  isPlaying,
  refreshTrigger,
  isAuthenticated
}) => {
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [recentlyPlayed, setRecentlyPlayed] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setRecentlyPlayed([]);
      return;
    }

    let mounted = true;
    const loadRecent = async () => {
      try {
        const data = await recentlyPlayedService.getPlayedMusic();
        if (mounted) setRecentlyPlayed(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setRecentlyPlayed([]);
      }
    };

    loadRecent();
    return () => {
      mounted = false;
    };
  }, [refreshTrigger, isAuthenticated]);

  const handleAddToPlaylist = (song, e) => {
    e.stopPropagation();
    setSelectedSongForPlaylist(song);
    setIsModalOpen(true);
  };

  return (
    <div className="py-6">
      <AddToPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        song={selectedSongForPlaylist}
      />

      {/* Recently Played Section (only shown when authenticated and has data) */}
      {isAuthenticated && recentlyPlayed && recentlyPlayed.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recently Played</h3>
            <p className="text-xs text-gray-400">
              Your recent listening history
            </p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyPlayed.map((s, i) => {
              // backend returns rows where `song_id` may be populated with the song object
              const songObj = s && s.song_id ? s.song_id : s;
              return (
                <div
                  key={(songObj && songObj.id) || i}
                  className="min-w-[200px] w-[200px] flex-shrink-0 group bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-lg overflow-hidden border border-gray-700/20 cursor-pointer hover:border-cyan-500/30 transition-all"
                  onClick={() => playSong(songObj)}
                >
                  <div className="relative w-full aspect-square bg-gray-900/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        (songObj && (songObj.image || songObj.album_art)) ||
                        'https://via.placeholder.com/400x400?text=Song'
                      }
                      alt={
                        (songObj && (songObj.title || songObj.song)) || 'Song'
                      }
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) =>
                        (e.target.src =
                          'https://via.placeholder.com/400x400?text=Song')
                      }
                    />
                    <button
                      onClick={(e) => handleAddToPlaylist(songObj, e)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-cyan-600/80 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                      title="Add to playlist"
                    >
                      <PlusIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="p-3">
                    <div
                      className="font-medium text-sm text-white mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
                      title={
                        (songObj && (songObj.title || songObj.song)) ||
                        'Unknown'
                      }
                    >
                      {(songObj && (songObj.title || songObj.song)) ||
                        'Unknown'}
                    </div>
                    <div
                      className="text-xs text-gray-400 mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
                      title={
                        (songObj && (songObj.artist || songObj.music)) || ''
                      }
                    >
                      {(songObj && (songObj.artist || songObj.music)) || ''}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {songObj && songObj.year && <span>{songObj.year}</span>}
                      {songObj && songObj.duration && (
                        <>
                          {songObj.year && <span>•</span>}
                          <span>{formatDuration(songObj.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-cyan-400 via-blue-400 bg-clip-text text-transparent">
          Discover Music
        </h2>
        <p className="text-gray-500 text-sm">Explore your favorite tracks</p>
      </div>

      {!songs || songs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No songs found</div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {songs.map((song, index) => {
            const isCurrentSong =
              currentSong && currentSong.media_url === song.media_url;
            return (
              <div
                key={index}
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
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleAddToPlaylist(song, e)}
                      className="p-2 bg-black/60 hover:bg-cyan-600/80 rounded-full backdrop-blur-sm transition-all"
                      title="Add to playlist"
                    >
                      <PlusIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(song);
                      }}
                      className="p-2 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-all"
                    >
                      {isCurrentSong && isPlaying ? (
                        <PauseIcon className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <PlayIcon className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
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
      )}
    </div>
  );
};

export default SongList;

import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/solid';
import { musicService } from '../api/musicService';
import { playlistService } from '../api/playlistService';

const AddSongsToPlaylistModal = ({ isOpen, onClose, playlist }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedSongs, setAddedSongs] = useState(new Set());
  const [addingStates, setAddingStates] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchSongs();
      setSearchQuery('');
      setAddedSongs(new Set());
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = songs.filter(
        (song) =>
          song.song?.toLowerCase().includes(query) ||
          song.music?.toLowerCase().includes(query)
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, songs]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await musicService.getAllSongs();
      setSongs(data);
      setFilteredSongs(data);
    } catch (err) {
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (song) => {
    try {
      setAddingStates((prev) => ({ ...prev, [song.id]: true }));
      setError('');
      await playlistService.addSongToPlaylist(playlist.id, song.id);
      setAddedSongs((prev) => new Set([...prev, song.id]));
      setTimeout(() => {
        setAddedSongs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(song.id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to add song');
    } finally {
      setAddingStates((prev) => ({ ...prev, [song.id]: false }));
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl w-full max-w-4xl max-h-[85vh] border border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Add Songs</h2>
            <p className="text-sm text-gray-400 mt-1">
              to {playlist?.playlist_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MusicalNoteIcon className="w-16 h-16 text-gray-600 mb-3" />
              <p className="text-gray-400">
                {searchQuery ? 'No songs found' : 'No songs available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSongs.map((song) => {
                const isAdding = addingStates[song.id];
                const wasAdded = addedSongs.has(song.id);

                return (
                  <div
                    key={song.id}
                    className="bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/30 rounded-lg p-3 flex items-center gap-3 transition-all group"
                  >
                    {/* Album Art */}
                    <img
                      src={song.image}
                      alt={song.song}
                      className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/100x100?text=Song';
                      }}
                    />

                    {/* Song Info */}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-white truncate">
                        {song.song}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {song.music || 'Unknown Artist'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        {song.year && <span>{song.year}</span>}
                        {song.duration && (
                          <>
                            {song.year && <span>•</span>}
                            <span>
                              {formatDuration(parseInt(song.duration))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleAddSong(song)}
                      disabled={isAdding || wasAdded}
                      className={`flex-shrink-0 p-2 rounded-full transition-all ${
                        wasAdded
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white opacity-0 group-hover:opacity-100'
                      } disabled:opacity-50`}
                      title={wasAdded ? 'Added' : 'Add to playlist'}
                    >
                      {isAdding ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : wasAdded ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <PlusIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongsToPlaylistModal;

import React, { useEffect, useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { playlistService } from '../api/playlistService';

const AddToPlaylistModal = ({ isOpen, onClose, song }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
      setShowCreateNew(false);
      setNewPlaylistName('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getAllPlaylists();
      setPlaylists(data);
    } catch (err) {
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setError('');
      setSuccess('');
      await playlistService.addSongToPlaylist(playlistId, song.id);
      setSuccess('Song added to playlist!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add song to playlist');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      setSuccess('');
      const newPlaylist = await playlistService.createPlaylist(
        newPlaylistName.trim()
      );
      await playlistService.addSongToPlaylist(newPlaylist.id, song.id);
      setSuccess('Playlist created and song added!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create playlist and add song');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Song Info */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <img
            src={song.image}
            alt={song.song}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-white truncate">
              {song.song}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {song.music || 'Unknown Artist'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Messages */}
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Create New Playlist Section */}
          {showCreateNew ? (
            <form onSubmit={handleCreateAndAdd} className="mb-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? 'Creating...' : 'Create & Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateNew(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateNew(true)}
              className="w-full mb-4 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create New Playlist
            </button>
          )}

          {/* Existing Playlists */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No playlists yet. Create one above!
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 font-medium mb-2">
                YOUR PLAYLISTS
              </div>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500/30 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">
                      {playlist.playlist_name}
                    </span>
                    <PlusIcon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;

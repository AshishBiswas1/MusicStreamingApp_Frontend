import React, { useState, useEffect } from 'react';
import { playlistService } from '../api/playlistService';
import PlaylistSongs from './PlaylistSongs';
import AddSongsToPlaylistModal from './AddSongsToPlaylistModal';
import {
  PlusIcon,
  TrashIcon,
  MusicalNoteIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Playlists = ({ currentSong, playSong, isPlaying }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [playlistForAddingSongs, setPlaylistForAddingSongs] = useState(null);
  const [playlistCovers, setPlaylistCovers] = useState({});

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playlistService.getAllPlaylists();
      setPlaylists(data);

      // Fetch first song image for each playlist
      const covers = {};
      await Promise.all(
        data.map(async (playlist) => {
          try {
            const songs = await playlistService.getPlaylistSongs(playlist.id);
            if (songs && songs.length > 0 && songs[0].image) {
              covers[playlist.id] = songs[0].image;
            }
          } catch (err) {
            // If fetching songs fails, just skip the cover
            console.error(`Failed to fetch cover for playlist ${playlist.id}`);
          }
        })
      );
      setPlaylistCovers(covers);
    } catch (err) {
      setError(err.message || 'Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setCreating(true);
      await playlistService.createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateModal(false);
      await fetchPlaylists();
    } catch (err) {
      setError(err.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      setDeleteLoading(playlistId);
      await playlistService.deletePlaylist(playlistId);
      await fetchPlaylists();
    } catch (err) {
      setError(err.message || 'Failed to delete playlist');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAddSongs = (playlist, e) => {
    e.stopPropagation();
    setPlaylistForAddingSongs(playlist);
    setShowAddSongsModal(true);
  };

  const handleCloseAddSongsModal = async () => {
    setShowAddSongsModal(false);
    // Refresh the cover for the playlist that was modified
    if (playlistForAddingSongs) {
      try {
        const songs = await playlistService.getPlaylistSongs(
          playlistForAddingSongs.id
        );
        if (songs && songs.length > 0 && songs[0].image) {
          setPlaylistCovers((prev) => ({
            ...prev,
            [playlistForAddingSongs.id]: songs[0].image
          }));
        }
      } catch (err) {
        console.error('Failed to refresh playlist cover');
      }
    }
  };

  // If a playlist is selected, show the PlaylistSongs component
  if (selectedPlaylist) {
    return (
      <PlaylistSongs
        playlistId={selectedPlaylist.id}
        playlistName={selectedPlaylist.playlist_name}
        onBack={() => setSelectedPlaylist(null)}
        currentSong={currentSong}
        playSong={playSong}
        isPlaying={isPlaying}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-gray-400">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-32">
      <AddSongsToPlaylistModal
        isOpen={showAddSongsModal}
        onClose={handleCloseAddSongsModal}
        playlist={playlistForAddingSongs}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Your Playlists
          </h1>
          <p className="text-gray-400">
            {playlists.length}{' '}
            {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Create Playlist</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <MusicalNoteIcon className="w-20 h-20 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No playlists yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first playlist to organize your favorite songs
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Create Playlist</span>
          </button>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
            >
              {/* Playlist Cover */}
              <div
                className="relative mb-4"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div className="w-full aspect-square bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 overflow-hidden">
                  {playlistCovers[playlist.id] ? (
                    <img
                      src={playlistCovers[playlist.id]}
                      alt={playlist.playlist_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <MusicalNoteIcon
                    className="w-16 h-16 text-cyan-400"
                    style={{
                      display: playlistCovers[playlist.id] ? 'none' : 'block'
                    }}
                  />
                </div>
              </div>

              {/* Playlist Info */}
              <div
                className="mb-4"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <h3 className="text-lg font-semibold text-white mb-1 truncate">
                  {playlist.playlist_name}
                </h3>
                <p className="text-sm text-gray-400">
                  Created {formatDate(playlist.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleAddSongs(playlist, e)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Songs</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id);
                  }}
                  disabled={deleteLoading === playlist.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/30 hover:border-red-500/50 disabled:opacity-50"
                >
                  {deleteLoading === playlist.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-6">
                <label
                  htmlFor="playlistName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Playlist Name
                </label>
                <input
                  type="text"
                  id="playlistName"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || creating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;

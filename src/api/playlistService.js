import { API_ENDPOINTS } from './config';

/**
 * Helper function to get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Helper function to make authenticated API calls
 */
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

/**
 * Playlist API Service
 */
export const playlistService = {
  /**
   * Get all playlists for the authenticated user
   */
  getAllPlaylists: async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.playlist.getAll());
      return response.data || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  },

  /**
   * Create a new playlist
   */
  createPlaylist: async (playlistName) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.playlist.create(), {
        method: 'POST',
        body: JSON.stringify({ playlistName })
      });
      return response.data;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  /**
   * Get a specific playlist by ID
   */
  getPlaylistById: async (id) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.playlist.getById(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error;
    }
  },

  /**
   * Delete a playlist
   */
  deletePlaylist: async (id) => {
    try {
      await fetchWithAuth(API_ENDPOINTS.playlist.delete(id), {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  /**
   * Get songs in a playlist
   */
  getPlaylistSongs: async (id) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.playlist.getSongs(id));
      return response.songs || [];
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      throw error;
    }
  },

  /**
   * Add a song to a playlist
   */
  addSongToPlaylist: async (playlistId, songId) => {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.playlist.addSong(playlistId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song_id: songId })
        }
      );
      return response;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  }
};

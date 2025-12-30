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
 * Music API Service
 */
export const musicService = {
  /**
   * Get all songs
   */
  getAllSongs: async () => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.music.getAll());
      // Backend returns { status, length, songs }
      return data.songs || [];
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  },

  /**
   * Get recommended songs
   */
  getRecommendedSongs: async () => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.music.recommended());
      // Backend returns { status, recommended_from_db, length, recommended: [{ data: [...] }, { data: [...] }] }
      // Flatten the nested structure to get all songs
      if (data.recommended && Array.isArray(data.recommended)) {
        const allSongs = [];
        data.recommended.forEach((category) => {
          if (category.data && Array.isArray(category.data)) {
            allSongs.push(...category.data);
          }
        });
        return allSongs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching recommended songs:', error);
      throw error;
    }
  },

  /**
   * Get a single song by ID
   */
  getSongById: async (id) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.music.getById(id));
      return data.data;
    } catch (error) {
      console.error('Error fetching song:', error);
      throw error;
    }
  },

  /**
   * Upload a new song
   */
  uploadSong: async (formData) => {
    try {
      const token = getAuthToken();
      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.music.upload(), {
        method: 'POST',
        headers,
        body: formData // Don't set Content-Type for FormData
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Upload failed' }));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Error uploading song:', error);
      throw error;
    }
  },

  /**
   * Save recommended songs to songs table
   */
  saveRecommendedToSongs: async (songs) => {
    try {
      const items = Array.isArray(songs) ? songs : [songs];
      const data = await fetchWithAuth(API_ENDPOINTS.music.saveToSongs(), {
        method: 'POST',
        body: JSON.stringify({ items })
      });
      return data;
    } catch (error) {
      console.error('Error saving recommended songs:', error);
      throw error;
    }
  },

  /**
   * Like a song
   */
  likeSong: async (songId) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.music.likeSong(), {
        method: 'POST',
        body: JSON.stringify({ song_id: songId })
      });
      return data;
    } catch (error) {
      console.error('Error liking song:', error);
      throw error;
    }
  },

  /**
   * Get liked songs
   */
  getLikedSongs: async () => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.music.getLikedSongs());
      return data.songs || [];
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      throw error;
    }
  },

  /**
   * Unlike a song
   */
  unlikeSong: async (songId) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.music.unlikeSong(), {
        method: 'DELETE',
        body: JSON.stringify({ song_id: songId })
      });
      return data;
    } catch (error) {
      console.error('Error unliking song:', error);
      throw error;
    }
  },

  /**
   * Check if a song is liked
   */
  checkIfLiked: async (songId) => {
    try {
      const songs = await musicService.getLikedSongs();
      return songs.some((song) => song.id === songId);
    } catch (error) {
      console.error('Error checking if song is liked:', error);
      return false;
    }
  }
};

/**
 * Recently Played API Service
 */
export const recentlyPlayedService = {
  /**
   * Track a played song
   */
  setPlayedMusic: async (songId) => {
    try {
      const data = await fetchWithAuth(
        API_ENDPOINTS.recentlyPlayed.setMusic(),
        {
          method: 'POST',
          body: JSON.stringify({ song_id: songId })
        }
      );
      return data;
    } catch (error) {
      console.error('Error tracking played music:', error);
      throw error;
    }
  },

  /**
   * Get recently played music
   */
  getPlayedMusic: async () => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.recentlyPlayed.getMusic());
      return data.data || [];
    } catch (error) {
      console.error('Error fetching recently played music:', error);
      throw error;
    }
  },

  /**
   * Track a played podcast
   */
  setPlayedPodcast: async (podcastId) => {
    try {
      const data = await fetchWithAuth(
        API_ENDPOINTS.recentlyPlayed.setPodcast(),
        {
          method: 'POST',
          body: JSON.stringify({ podcast_id: podcastId })
        }
      );
      return data;
    } catch (error) {
      console.error('Error tracking played podcast:', error);
      throw error;
    }
  },

  /**
   * Get recently played podcasts
   */
  getPlayedPodcast: async () => {
    try {
      const data = await fetchWithAuth(
        API_ENDPOINTS.recentlyPlayed.getPodcast()
      );
      return data.data || [];
    } catch (error) {
      console.error('Error fetching recently played podcasts:', error);
      throw error;
    }
  }
};

/**
 * Podcast API Service
 */
export const podcastService = {
  /**
   * Get best podcasts
   */
  getBestPodcasts: async (page = 1) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.podcast.getBest(page));
      return data.data || [];
    } catch (error) {
      console.error('Error fetching best podcasts:', error);
      throw error;
    }
  },

  /**
   * Search podcasts
   */
  searchPodcasts: async (query, page = 1) => {
    try {
      const data = await fetchWithAuth(
        API_ENDPOINTS.podcast.search(query, page)
      );
      return data.data || [];
    } catch (error) {
      console.error('Error searching podcasts:', error);
      throw error;
    }
  },

  /**
   * Save a podcast
   */
  savePodcast: async (podcastData) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.podcast.save(), {
        method: 'POST',
        body: JSON.stringify(podcastData)
      });
      return data;
    } catch (error) {
      console.error('Error saving podcast:', error);
      throw error;
    }
  },

  /**
   * Get saved podcasts
   */
  getSavedPodcasts: async () => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.podcast.getSaved());
      return data.podcasts || [];
    } catch (error) {
      console.error('Error fetching saved podcasts:', error);
      throw error;
    }
  },

  /**
   * Get one saved podcast by ID
   */
  getOneSavedPodcast: async (id) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.podcast.getOne(id));
      return data.podcast;
    } catch (error) {
      console.error('Error fetching saved podcast:', error);
      throw error;
    }
  },

  /**
   * Set podcast history
   */
  setPodcastHistory: async (historyData) => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.podcast.setHistory(), {
        method: 'POST',
        body: JSON.stringify(historyData)
      });
      return data.history;
    } catch (error) {
      console.error('Error setting podcast history:', error);
      throw error;
    }
  },

  /**
   * Get podcast history
   */
  getPodcastHistory: async () => {
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.podcast.getHistory());
      return data.history || [];
    } catch (error) {
      console.error('Error fetching podcast history:', error);
      throw error;
    }
  }
};

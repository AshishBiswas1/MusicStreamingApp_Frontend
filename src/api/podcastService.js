import { API_ENDPOINTS } from './config';

/**
 * Helper function to get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper: fetch with retry on 429 / 5xx
const fetchWithRetry = async (
  url,
  options = {},
  attempts = 3,
  delayMs = 500
) => {
  let attempt = 0;
  while (attempt < attempts) {
    try {
      return await fetchWithAuth(url, options);
    } catch (err) {
      attempt += 1;
      const status = err && err.status;
      // Retry for 429 (rate limit) or 5xx server errors
      if (
        attempt < attempts &&
        (status === 429 || (status >= 500 && status < 600))
      ) {
        const backoff = delayMs * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 200);
        await new Promise((res) => setTimeout(res, backoff + jitter));
        continue;
      }
      throw err;
    }
  }
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
      const msg =
        error && error.message
          ? error.message
          : `HTTP error! status: ${response.status}`;
      const err = new Error(msg);
      // Attach status for callers to inspect
      err.status = response.status;
      throw err;
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

/**
 * Podcast API Service
 */
export const podcastService = {
  /**
   * Get best podcasts with episodes
   * @param {number} page - Page number for pagination
   * @returns {Promise} List of podcasts with episodes
   */
  getBestPodcasts: async (page = 1) => {
    try {
      const response = await fetchWithRetry(
        `${API_ENDPOINTS.PODCAST}?page=${page}`,
        {},
        4,
        500
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching best podcasts:', error);
      throw error;
    }
  },

  /**
   * Search podcasts by name
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  searchPodcasts: async (query) => {
    try {
      const response = await fetchWithRetry(
        `${API_ENDPOINTS.PODCAST}/search?q=${encodeURIComponent(query)}`,
        {},
        4,
        400
      );
      return response.data || [];
    } catch (error) {
      console.error('Error searching podcasts:', error);
      throw error;
    }
  },

  /**
   * Save a podcast
   * @param {object} podcast - Podcast data to save
   * @returns {Promise} Saved podcast data
   */
  savePodcast: async (podcast) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.PODCAST, {
        method: 'POST',
        body: JSON.stringify(podcast)
      });
      return response;
    } catch (error) {
      console.error('Error saving podcast:', error);
      throw error;
    }
  },

  /**
   * Get saved podcasts for current user
   * @returns {Promise} List of saved podcasts
   */
  getSavedPodcasts: async () => {
    try {
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.PODCAST}/getSavedPodcast`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching saved podcasts:', error);
      throw error;
    }
  },

  /**
   * Get one saved podcast by ID
   * @param {string} id - Podcast ID
   * @returns {Promise} Podcast data
   */
  getOneSavedPodcast: async (id) => {
    try {
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.PODCAST}/getOneSavePodcast/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching saved podcast:', error);
      throw error;
    }
  },

  /**
   * Set podcast listening history
   * @param {object} historyData - History data to save
   * @returns {Promise} Response data
   */
  setPodcastHistory: async (historyData) => {
    try {
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.PODCAST}/setHistory`,
        {
          method: 'POST',
          body: JSON.stringify(historyData)
        }
      );
      return response;
    } catch (error) {
      console.error('Error setting podcast history:', error);
      throw error;
    }
  },

  /**
   * Get podcast listening history
   * @returns {Promise} List of podcast history
   */
  getPodcastHistory: async () => {
    try {
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.PODCAST}/getHistory`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching podcast history:', error);
      throw error;
    }
  }
};

export default podcastService;

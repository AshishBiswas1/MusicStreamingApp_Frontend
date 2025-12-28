// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://musicstreamingapp-backend.onrender.com';

export const API_ENDPOINTS = {
  // Music endpoints
  music: {
    getAll: () => `${API_BASE_URL}/api/music`,
    getById: (id) => `${API_BASE_URL}/api/music/${id}`,
    upload: () => `${API_BASE_URL}/api/music/upload`,
    recommended: () => `${API_BASE_URL}/api/music/recommended`
  },

  // Podcast endpoints
  podcast: {
    getBest: (page = 1) => `${API_BASE_URL}/api/podcast?page=${page}`,
    search: (query, page = 1) =>
      `${API_BASE_URL}/api/podcast/search?q=${encodeURIComponent(
        query
      )}&page=${page}`,
    save: () => `${API_BASE_URL}/api/podcast`,
    getSaved: () => `${API_BASE_URL}/api/podcast/getSavedPodcast`,
    getOne: (id) => `${API_BASE_URL}/api/podcast/getOneSavePodcast/${id}`,
    setHistory: () => `${API_BASE_URL}/api/podcast/setHistory`,
    getHistory: () => `${API_BASE_URL}/api/podcast/getHistory`
  },

  // Recently played endpoints
  recentlyPlayed: {
    setMusic: () => `${API_BASE_URL}/api/recently-played/music`,
    getMusic: () => `${API_BASE_URL}/api/recently-played/music`,
    setPodcast: () => `${API_BASE_URL}/api/recently-played/podcast`,
    getPodcast: () => `${API_BASE_URL}/api/recently-played/podcast`
  },

  // User endpoints
  user: {
    signup: () => `${API_BASE_URL}/api/user/signup`,
    login: () => `${API_BASE_URL}/api/user/login`,
    getMe: () => `${API_BASE_URL}/api/user/me`,
    updateMe: () => `${API_BASE_URL}/api/user/updateMe`,
    deleteMe: () => `${API_BASE_URL}/api/user/deleteMe`
  }
};

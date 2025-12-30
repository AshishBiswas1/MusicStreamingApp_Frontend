// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://musicstreamingapp-backend.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: `${API_BASE_URL}/api/user`,

  // Music endpoints
  MUSIC: `${API_BASE_URL}/api/music`,

  // Podcast endpoints
  PODCAST: `${API_BASE_URL}/api/podcast`,

  // Recently played endpoints
  RECENTLY_PLAYED: `${API_BASE_URL}/api/recently-played`,

  // Legacy detailed endpoints
  music: {
    getAll: () => `${API_BASE_URL}/api/music`,
    getById: (id) => `${API_BASE_URL}/api/music/${id}`,
    upload: () => `${API_BASE_URL}/api/music/upload`,
    recommended: () => `${API_BASE_URL}/api/music/recommended`,
    saveToSongs: () => `${API_BASE_URL}/api/music/savetosongs`,
    likeSong: () => `${API_BASE_URL}/api/music/like`,
    unlikeSong: () => `${API_BASE_URL}/api/music/unlike`,
    getLikedSongs: () => `${API_BASE_URL}/api/music/liked`
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
    // Backend mounts router at /api/recent, routes are /RecentMusic and /RecentPodcast
    setMusic: () => `${API_BASE_URL}/api/recent/RecentMusic`,
    getMusic: () => `${API_BASE_URL}/api/recent/RecentMusic`,
    setPodcast: () => `${API_BASE_URL}/api/recent/RecentPodcast`,
    getPodcast: () => `${API_BASE_URL}/api/recent/RecentPodcast`
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

import React, { useState, useEffect } from 'react';
import { podcastService } from '../api/podcastService';
import { recentlyPlayedService } from '../api/musicService';
import PodcastPlayer from './PodcastPlayer';
import Toast from './Toast';
import {
  PlayIcon,
  PauseIcon,
  BookmarkIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const Podcasts = ({ viewMode }) => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [retryDisabled, setRetryDisabled] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [savedPodcasts, setSavedPodcasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Podcast player state
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
    visible: false
  });

  // Fetch podcasts on mount and when viewMode changes
  useEffect(() => {
    fetchPodcasts();
    fetchSavedPodcasts();
  }, [currentPage, viewMode]);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorStatus(null);

      // If viewMode is podcast history (server-side saved history)
      if (viewMode === 'PodcastHistory') {
        const data = await podcastService.getPodcastHistory();
        // podcastService.getPodcastHistory() returns an array of podcast objects
        setPodcasts(Array.isArray(data) ? data : []);
        return;
      }

      // If viewMode is saved podcasts
      if (viewMode === 'PodcastSaved') {
        const data = await podcastService.getSavedPodcasts();
        setPodcasts(Array.isArray(data) ? data : []);
        return;
      }

      // If viewMode is recently played podcasts (recently_played router)
      if (viewMode === 'PodcastRecently') {
        const rows = await recentlyPlayedService.getPlayedPodcast();
        // rows are objects with `.podcast` populated (see backend). Map to podcast objects where available
        const mapped = (Array.isArray(rows) ? rows : []).map(
          (r) => r.podcast || r
        );
        setPodcasts(mapped.filter(Boolean));
        return;
      }

      // Default: fetch best podcasts
      const data = await podcastService.getBestPodcasts(currentPage);
      setPodcasts(data);
    } catch (err) {
      const msg = err && err.message ? err.message : 'Failed to fetch podcasts';
      setError(msg);
      setErrorStatus(err && err.status ? err.status : null);
      console.error('Error fetching podcasts:', err);

      // If rate-limited, disable retry for a short period and show countdown
      if (err && err.status === 429) {
        setRetryDisabled(true);
        let countdown = 10;
        setRetryCountdown(countdown);
        const interval = setInterval(() => {
          countdown -= 1;
          setRetryCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(interval);
            setRetryDisabled(false);
            setRetryCountdown(0);
          }
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPodcasts = async () => {
    try {
      const data = await podcastService.getSavedPodcasts();
      setSavedPodcasts(data);
    } catch (err) {
      console.error('Error fetching saved podcasts:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchPodcasts();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
      const data = await podcastService.searchPodcasts(searchQuery);
      setPodcasts(data);
    } catch (err) {
      const msg =
        err && err.message ? err.message : 'Failed to search podcasts';
      setError(msg);
      setErrorStatus(err && err.status ? err.status : null);
      console.error('Error searching podcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryDisabled) return;
    // clear error and retry
    setError(null);
    setErrorStatus(null);
    fetchPodcasts();
  };

  const handleSavePodcast = async (podcast) => {
    try {
      await podcastService.savePodcast({
        id: podcast.id,
        title: podcast.title,
        publisher: podcast.publisher,
        image: podcast.image
      });
      // Refresh saved list
      await fetchSavedPodcasts();

      // If we're currently viewing saved podcasts, refresh the displayed list too
      if (viewMode === 'PodcastSaved') {
        await fetchPodcasts();
      }

      // show a success toast
      setToast({
        message: 'Podcast saved successfully',
        type: 'success',
        visible: true
      });
    } catch (err) {
      console.error('Error saving podcast:', err);
      setToast({
        message: 'Failed to save podcast',
        type: 'error',
        visible: true
      });
    }
  };

  const isPodcastSaved = (podcastId) => {
    return savedPodcasts.some((p) => p.id === podcastId);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Podcast player functions
  const playEpisode = (episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    setShowPlayer(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!selectedPodcast?.episodes || !currentEpisode) return;
    const currentIndex = selectedPodcast.episodes.findIndex(
      (ep) => ep.id === currentEpisode.id
    );
    if (currentIndex < selectedPodcast.episodes.length - 1) {
      playEpisode(selectedPodcast.episodes[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedPodcast?.episodes || !currentEpisode) return;
    const currentIndex = selectedPodcast.episodes.findIndex(
      (ep) => ep.id === currentEpisode.id
    );
    if (currentIndex > 0) {
      playEpisode(selectedPodcast.episodes[currentIndex - 1]);
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast((t) => ({ ...t, visible: false }))}
        />
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Podcasts
        </h1>
        <p className="text-gray-400">
          Discover and listen to the best podcasts
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search podcasts..."
            className="w-full px-6 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            {errorStatus === 429 ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-400">
                  Rate limit reached. Please wait before retrying.
                </p>
                <button
                  onClick={handleRetry}
                  disabled={retryDisabled}
                  className={`px-4 py-2 rounded-lg transition-all shadow-lg ${
                    retryDisabled
                      ? 'bg-gray-700/40 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                  }`}
                >
                  {retryDisabled ? `Retry in ${retryCountdown}s` : 'Retry Now'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Podcast Grid */}
      {!loading && !error && !selectedPodcast && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="group bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer"
              onClick={() => setSelectedPodcast(podcast)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={podcast.image}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/400x400?text=Podcast';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSavePodcast(podcast);
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  {isPodcastSaved(podcast.id) ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {podcast.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                  {podcast.publisher}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded">
                    {podcast.episodes?.length || 0} episodes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Podcast Detail View */}
      {selectedPodcast && (
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedPodcast(null)}
            className="mb-6 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all"
          >
            ← Back to Podcasts
          </button>

          <div className="bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/30 overflow-hidden">
            {/* Podcast Header */}
            <div className="flex flex-col md:flex-row gap-6 p-8 border-b border-gray-700/30">
              <img
                src={selectedPodcast.image}
                alt={selectedPodcast.title}
                className="w-64 h-64 object-cover rounded-xl shadow-2xl"
                onError={(e) => {
                  e.target.src =
                    'https://via.placeholder.com/400x400?text=Podcast';
                }}
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {selectedPodcast.title}
                </h1>
                <p className="text-xl text-gray-400 mb-4">
                  {selectedPodcast.publisher}
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">
                    {selectedPodcast.episodes?.length || 0} episodes
                  </span>
                </div>
                <button
                  onClick={() => handleSavePodcast(selectedPodcast)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  {isPodcastSaved(selectedPodcast.id) ? (
                    <>
                      <BookmarkSolidIcon className="w-5 h-5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkIcon className="w-5 h-5" />
                      Save Podcast
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Episodes List */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Episodes</h2>
              {selectedPodcast.episodes &&
              selectedPodcast.episodes.length > 0 ? (
                <div className="space-y-3">
                  {selectedPodcast.episodes.map((episode, index) => (
                    <div
                      key={episode.id}
                      className="group p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg border border-gray-700/20 hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {episode.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            {episode.audio_length_sec && (
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {formatDuration(episode.audio_length_sec)}
                              </span>
                            )}
                            {episode.pub_date_ms && (
                              <span>{formatDate(episode.pub_date_ms)}</span>
                            )}
                          </div>
                        </div>
                        {episode.audio && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playEpisode(episode);
                            }}
                            className={`flex-shrink-0 p-3 rounded-full transition-all ${
                              currentEpisode?.id === episode.id
                                ? 'bg-purple-500 hover:bg-purple-600 opacity-100'
                                : 'bg-cyan-500 hover:bg-cyan-600 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {currentEpisode?.id === episode.id && isPlaying ? (
                              <PauseIcon className="w-5 h-5 text-white" />
                            ) : (
                              <PlayIcon className="w-5 h-5 text-white" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No episodes available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && !selectedPodcast && podcasts.length > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            Previous
          </button>
          <span className="px-6 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
            Page {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-6 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Podcast Player */}
      {currentEpisode && showPlayer && (
        <PodcastPlayer
          currentEpisode={currentEpisode}
          podcastInfo={selectedPodcast}
          allEpisodes={selectedPodcast?.episodes || []}
          isPlaying={isPlaying}
          onClose={handleClosePlayer}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default Podcasts;

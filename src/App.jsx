import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SongList from './components/SongList';
import Player from './components/Player';
import NowPlaying from './components/NowPlaying';
import Podcasts from './components/Podcasts';
import LikedSongs from './components/LikedSongs';
import Playlists from './components/Playlists';
import Profile from './components/Profile';
import History from './components/History';
import { musicService, recentlyPlayedService } from './api/musicService';
import { authService } from './api/authService';
import { useAuth } from './context/AuthContext';

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentlyPlayedRefresh, setRecentlyPlayedRefresh] = useState(0);
  const audioRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const trackingTimerRef = useRef(null);

  // Close player (hide it without stopping playback)
  const closePlayer = () => {
    // Clear tracking timer if song is closed before 2 seconds
    if (trackingTimerRef.current) {
      clearTimeout(trackingTimerRef.current);
      trackingTimerRef.current = null;
    }

    setShowPlayer(false);
    // Pause the audio when player is closed so playback stops
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (e) {
        console.warn('Failed to pause audio on close:', e);
      }
    }
    setIsPlaying(false);
  };

  // Cleanup tracking timer on unmount
  useEffect(() => {
    return () => {
      if (trackingTimerRef.current) {
        clearTimeout(trackingTimerRef.current);
      }
    };
  }, []);

  // Show player when song is played
  useEffect(() => {
    if (currentSong) {
      setShowPlayer(true);
    }
  }, [currentSong]);

  // Load last played song when user logs in
  useEffect(() => {
    const loadLastPlayedSong = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await authService.getLastPlayedSong();

        if (response.status === 'success' && response.data.song) {
          const lastSong = response.data.song;
          console.log('Loading last played song:', lastSong.song);

          // Set the song but don't auto-play it
          setCurrentSong(lastSong);
          setShowPlayer(true);
          // Don't set isPlaying to true - let user manually play
        }
      } catch (error) {
        console.warn('Could not load last played song:', error);
        // Don't show error to user, just log it
      }
    };

    loadLastPlayedSong();
  }, [isAuthenticated]);

  // Fetch songs from backend on component mount or category change
  useEffect(() => {
    // Skip fetching if Podcasts category is selected
    if (selectedCategory === 'Podcasts') {
      setLoading(false);
      return;
    }

    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedSongs;
        if (selectedCategory === 'Recommended' && isAuthenticated) {
          // Fetch recommended songs for authenticated users
          fetchedSongs = await musicService.getRecommendedSongs();
        } else {
          // Fetch all songs
          fetchedSongs = await musicService.getAllSongs();
        }

        setSongs(fetchedSongs);
      } catch (err) {
        setError(err.message || 'Failed to fetch songs');
        console.error('Error loading songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [selectedCategory, isAuthenticated]);

  // Filter songs based on search and category
  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.music &&
        song.music.toLowerCase().includes(searchQuery.toLowerCase()));

    // For 'All' and 'Recommended' categories, just apply search filter
    return matchesSearch;
  });

  // Play/Pause toggle
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Play specific song and track it after 2 seconds
  const playSong = async (song) => {
    // Clear any existing tracking timer
    if (trackingTimerRef.current) {
      clearTimeout(trackingTimerRef.current);
      trackingTimerRef.current = null;
    }

    // Show player first
    setShowPlayer(true);

    // Set song and playing state
    setCurrentSong(song);
    setIsPlaying(true);

    // Wait for React to update the audio src, then play
    setTimeout(() => {
      if (audioRef.current) {
        try {
          // ensure not muted and reasonable volume
          audioRef.current.muted = false;
          audioRef.current.volume = audioRef.current.volume || 1;
        } catch (e) {
          console.warn('Failed to set audio properties before play:', e);
        }

        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
      }
    }, 50);

    // Track played song after 2 seconds of playback
    trackingTimerRef.current = setTimeout(async () => {
      try {
        // If on Recommended page and song doesn't have an id (external song),
        // save it to songs table first
        if (selectedCategory === 'Recommended' && !song.id) {
          try {
            const savedResponse = await musicService.saveRecommendedToSongs([
              song
            ]);
            if (savedResponse.songs && savedResponse.songs.length > 0) {
              const savedSong = savedResponse.songs[0];
              // Update current song with the saved song's id
              song.id = savedSong.id;
              console.log('Song saved to songs table:', savedSong.id);
            }
          } catch (saveErr) {
            console.warn('Failed to save song to songs table:', saveErr);
          }
        }

        // Track in recently played if song has an id
        if (song.id) {
          await recentlyPlayedService.setPlayedMusic(song.id);
          console.log('Song tracked:', song.song || song.title);
          // Trigger refresh of recently played section
          setRecentlyPlayedRefresh((prev) => prev + 1);
        }
      } catch (err) {
        console.warn('Failed to track played song:', err);
      }
    }, 2000); // 2 seconds delay
  };

  // Next/Previous song
  const playNext = () => {
    if (currentSong) {
      const currentIndex = filteredSongs.findIndex(
        (s) => s.media_url === currentSong.media_url
      );
      const nextIndex = (currentIndex + 1) % filteredSongs.length;
      playSong(filteredSongs[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (currentSong) {
      const currentIndex = filteredSongs.findIndex(
        (s) => s.media_url === currentSong.media_url
      );
      const prevIndex =
        currentIndex === 0 ? filteredSongs.length - 1 : currentIndex - 1;
      playSong(filteredSongs[prevIndex]);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white">
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSettingsClick={() => setShowProfile(true)}
          />

          {/* Conditional Content: Profile, Podcasts, or Song List */}
          {showProfile ? (
            <Profile onBack={() => setShowProfile(false)} />
          ) : selectedCategory === 'Podcasts' ? (
            <Podcasts />
          ) : selectedCategory === 'Liked Songs' ? (
            <LikedSongs
              currentSong={currentSong}
              playSong={playSong}
              isPlaying={isPlaying}
            />
          ) : selectedCategory === 'Playlists' ? (
            <Playlists
              currentSong={currentSong}
              playSong={playSong}
              isPlaying={isPlaying}
            />
          ) : selectedCategory === 'History' ? (
            <History
              currentSong={currentSong}
              playSong={playSong}
              isPlaying={isPlaying}
            />
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-32">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
                    <p className="text-gray-400">Loading songs...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-red-400 mb-2">⚠️ {error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                selectedCategory === 'Recommended' &&
                !isAuthenticated && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">
                        Please login to view recommended songs
                      </p>
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                      >
                        View All Songs
                      </button>
                    </div>
                  </div>
                )}

              {!loading &&
                !error &&
                filteredSongs.length === 0 &&
                (selectedCategory !== 'Recommended' || isAuthenticated) && (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">No songs found</p>
                  </div>
                )}

              {!loading && !error && filteredSongs.length > 0 && (
                <SongList
                  songs={filteredSongs}
                  currentSong={currentSong}
                  playSong={playSong}
                  isPlaying={isPlaying}
                  refreshTrigger={recentlyPlayedRefresh}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>
          )}
        </div>

        {/* Now Playing Sidebar */}
        {showNowPlaying && currentSong && (
          <NowPlaying
            currentSong={currentSong}
            onClose={() => setShowNowPlaying(false)}
          />
        )}

        {/* Hidden Audio Element */}
        {currentSong && (
          <audio
            ref={audioRef}
            src={currentSong.media_url}
            crossOrigin="anonymous"
            preload="metadata"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>

      {/* Floating Player - Outside main container for persistence */}
      {currentSong && showPlayer && (
        <Player
          currentSong={currentSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          playNext={playNext}
          playPrevious={playPrevious}
          audioRef={audioRef}
          setShowNowPlaying={setShowNowPlaying}
          onClose={closePlayer}
          songs={filteredSongs}
        />
      )}
    </>
  );
}

export default App;

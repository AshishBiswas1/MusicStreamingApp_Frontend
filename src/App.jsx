import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SongList from './components/SongList';
import Player from './components/Player';
import NowPlaying from './components/NowPlaying';
import Podcasts from './components/Podcasts';
import { musicService, recentlyPlayedService } from './api/musicService';
import { useAuth } from './context/AuthContext';

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Close player (hide it without stopping playback)
  const closePlayer = () => {
    setShowPlayer(false);
    // Don't pause the audio - let it continue playing
  };

  // Show player when song is played
  useEffect(() => {
    if (currentSong) {
      setShowPlayer(true);
    }
  }, [currentSong]);

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

  // Play specific song and track it
  const playSong = async (song) => {
    // Show player first
    setShowPlayer(true);

    // Set song and playing state
    setCurrentSong(song);
    setIsPlaying(true);

    // Wait for React to update the audio src, then play
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
      }
    }, 50);

    // Track played song (don't block playback if tracking fails)
    if (song.id) {
      try {
        await recentlyPlayedService.setPlayedMusic(song.id);
      } catch (err) {
        console.warn('Failed to track played song:', err);
      }
    }
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
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {/* Conditional Content: Podcasts or Song List */}
          {selectedCategory === 'Podcasts' ? (
            <Podcasts />
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

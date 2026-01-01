import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon,
  ArrowsPointingOutIcon,
  MinusIcon
} from '@heroicons/react/24/solid';
import {
  ArrowPathIcon,
  HeartIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { musicService } from '../api/musicService';

const Player = ({
  currentSong,
  isPlaying,
  togglePlay,
  playNext,
  playPrevious,
  audioRef,
  setShowNowPlaying,
  onClose,
  songs = []
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'single', 'all'
  const [isShuffle, setIsShuffle] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight - 520 : 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Check PiP support
  useEffect(() => {
    setIsPiPSupported(document.pictureInPictureEnabled);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    const handleEnded = () => {
      if (repeatMode === 'single') {
        // Repeat current song
        audio.currentTime = 0;
        audio.play().catch((err) => console.error('Play error:', err));
      } else if (repeatMode === 'all') {
        // Play next song
        playNext();
      } else {
        // Stop after song ends
        // Do nothing - let it naturally end
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, repeatMode, playNext]);

  // Media Session API for browser/OS controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.song,
        artist: currentSong.music || 'Unknown Artist',
        artwork: [
          { src: currentSong.image, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, [currentSong, togglePlay, playNext, playPrevious]);

  // Handle messages from popup window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.action === 'previous') {
        playPrevious();
      } else if (event.data.action === 'next') {
        playNext();
      } else if (event.data.action === 'toggleRepeat') {
        toggleRepeat();
      } else if (event.data.action === 'showQueue') {
        setShowNowPlaying(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playNext, playPrevious, setShowNowPlaying]);

  // Send updates to popup window when song changes
  useEffect(() => {
    if (window.musicPlayerPopup && !window.musicPlayerPopup.closed) {
      window.musicPlayerPopup.postMessage(
        {
          type: 'songUpdate',
          image: currentSong.image,
          song: currentSong.song,
          artist: currentSong.music
        },
        '*'
      );
    }
  }, [currentSong]);

  // Send repeat mode updates to popup
  useEffect(() => {
    if (window.musicPlayerPopup && !window.musicPlayerPopup.closed) {
      window.musicPlayerPopup.postMessage(
        {
          type: 'repeatUpdate',
          mode: repeatMode
        },
        '*'
      );
    }
  }, [repeatMode]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = Math.max(
        0,
        Math.min(e.clientX - dragOffset.x, window.innerWidth - 400)
      );
      const newY = Math.max(
        0,
        Math.min(e.clientY - dragOffset.y, window.innerHeight - 500)
      );
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 400),
        y: Math.min(prev.y, window.innerHeight - 500)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = (e.target.value / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'single';
      return 'none';
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const toggleMinimize = () => {
    if (!isMinimized) {
      // When minimizing, set position to be at bottom of sidebar
      setPosition({
        x: 20,
        y: typeof window !== 'undefined' ? window.innerHeight - 150 : 0
      });
    }
    setIsMinimized(!isMinimized);
  };

  const handleLikeSong = async () => {
    if (!currentSong || !currentSong.id) {
      console.warn('Cannot like song without ID');
      return;
    }

    try {
      if (isLiked) {
        // Unlike the song
        await musicService.unlikeSong(currentSong.id);
        setIsLiked(false);
        console.log('Song unliked:', currentSong.song);
      } else {
        // Like the song
        await musicService.likeSong(currentSong.id);
        setIsLiked(true);
        console.log('Song liked:', currentSong.song);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // If already liked, just toggle the UI
      if (error.message && error.message.includes('duplicate')) {
        setIsLiked(true);
      }
    }
  };

  // Check if song is liked when song changes
  useEffect(() => {
    const checkLikedStatus = async () => {
      if (currentSong && currentSong.id) {
        try {
          const liked = await musicService.checkIfLiked(currentSong.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Failed to check liked status:', error);
          setIsLiked(false);
        }
      } else {
        setIsLiked(false);
      }
    };

    checkLikedStatus();
  }, [currentSong]);

  const openInNewWindow = () => {
    // Open player in a new popup window
    const width = 420;
    const height = 600;
    const left = window.screen.width - width - 20;
    const top = window.screen.height - height - 100;

    const popup = window.open(
      '',
      'MusicPlayer',
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    );

    if (popup) {
      // Store reference to main window
      const mainWindow = window;

      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${currentSong.song} - Music Player</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #f59e0b, #ea580c, #f59e0b);
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                color: white;
              }
              .player-container {
                width: 100%;
                max-width: 380px;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255,255,255,0.2);
              }
              .header h1 {
                font-size: 18px;
                font-weight: 600;
                opacity: 0.9;
              }
              .album-art {
                width: 100%;
                max-width: 280px;
                height: 280px;
                margin: 0 auto 20px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                object-fit: cover;
                border: 3px solid rgba(255,255,255,0.3);
              }
              .song-info {
                text-align: center;
                margin-bottom: 20px;
              }
              .song-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .song-artist {
                font-size: 14px;
                opacity: 0.9;
              }
              .progress-container {
                margin-bottom: 20px;
              }
              .progress-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
              }
              .time {
                font-size: 11px;
                font-family: monospace;
                opacity: 0.8;
                min-width: 40px;
              }
              input[type="range"] {
                flex: 1;
                height: 6px;
                border-radius: 3px;
                background: rgba(0,0,0,0.2);
                outline: none;
                border: 1px solid rgba(255,255,255,0.2);
                cursor: pointer;
              }
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 20px;
              }
              button {
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
              }
              button:hover {
                background: rgba(255,255,255,0.25);
                transform: scale(1.05);
              }
              button:active {
                transform: scale(0.95);
              }
              .btn-small {
                width: 44px;
                height: 44px;
              }
              .btn-play {
                width: 64px;
                height: 64px;
                background: white;
                border: 2px solid rgba(255,255,255,0.5);
              }
              .btn-play:hover {
                background: rgba(255,255,255,0.95);
              }
              .btn-icon {
                width: 20px;
                height: 20px;
                fill: white;
              }
              .btn-play .btn-icon {
                fill: #ea580c;
                width: 28px;
                height: 28px;
              }
              .volume-control {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 15px;
              }
              .volume-btn {
                width: 40px;
                height: 40px;
              }
              .volume-slider {
                width: 120px;
              }
              .repeat-btn.active {
                background: rgba(255,255,255,0.3);
                border-color: rgba(255,255,255,0.5);
              }
              .repeat-indicator {
                position: absolute;
                top: -4px;
                right: -4px;
                font-size: 10px;
                font-weight: bold;
                background: white;
                color: #ea580c;
                border-radius: 50%;
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .note {
                text-align: center;
                font-size: 11px;
                opacity: 0.6;
                padding: 10px;
                border-top: 1px solid rgba(255,255,255,0.1);
              }
            </style>
          </head>
          <body>
            <div class="player-container">
              <div class="header">
                <h1>🎵 Music Player</h1>
              </div>
              
              <img id="albumArt" src="${currentSong.image}" alt="${
        currentSong.song
      }" class="album-art">
              
              <div class="song-info">
                <div id="songTitle" class="song-title">${currentSong.song}</div>
                <div id="songArtist" class="song-artist">${
                  currentSong.music || 'Unknown Artist'
                }</div>
              </div>

              <div class="progress-container">
                <div class="progress-bar">
                  <span id="currentTime" class="time">0:00</span>
                  <input type="range" id="seekBar" min="0" max="100" value="0">
                  <span id="duration" class="time">0:00</span>
                </div>
              </div>

              <div class="controls">
                <button id="repeatBtn" class="btn-small" title="Repeat">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                  </svg>
                  <span id="repeatIndicator" class="repeat-indicator" style="display:none;">1</span>
                </button>
                
                <button id="prevBtn" class="btn-small" title="Previous">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                
                <button id="playBtn" class="btn-play" title="Play/Pause">
                  <svg id="playIcon" class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg id="pauseIcon" class="btn-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                </button>
                
                <button id="nextBtn" class="btn-small" title="Next">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
                
                <button id="queueBtn" class="btn-small" title="Queue">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                  </svg>
                </button>
              </div>

              <div class="volume-control">
                <button id="muteBtn" class="volume-btn" title="Mute/Unmute">
                  <svg id="volumeIcon" class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                  <svg id="muteIcon" class="btn-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                </button>
                <input type="range" id="volumeBar" class="volume-slider" min="0" max="100" value="100">
              </div>

              <div class="note">
                Keep this window open to control playback from any tab
              </div>
            </div>

            <script>
              let repeatMode = 'none';
              let isPlaying = ${isPlaying};
              
              // Update UI based on play state
              function updatePlayButton(playing) {
                document.getElementById('playIcon').style.display = playing ? 'none' : 'block';
                document.getElementById('pauseIcon').style.display = playing ? 'block' : 'none';
              }
              updatePlayButton(isPlaying);

              // Format time
              function formatTime(seconds) {
                if (isNaN(seconds)) return '0:00';
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return mins + ':' + (secs < 10 ? '0' : '') + secs;
              }

              // Update from main window periodically
              setInterval(() => {
                if (window.opener && !window.opener.closed) {
                  try {
                    const audio = window.opener.document.querySelector('audio');
                    if (audio) {
                      document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
                      document.getElementById('duration').textContent = formatTime(audio.duration);
                      const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
                      document.getElementById('seekBar').value = progress;
                      
                      isPlaying = !audio.paused;
                      updatePlayButton(isPlaying);
                    }
                  } catch (e) {
                    console.error('Error syncing with main window:', e);
                  }
                }
              }, 500);

              // Play/Pause
              document.getElementById('playBtn').addEventListener('click', () => {
                if (window.opener && !window.opener.closed) {
                  const audio = window.opener.document.querySelector('audio');
                  if (audio) {
                    if (audio.paused) {
                      audio.play();
                    } else {
                      audio.pause();
                    }
                    isPlaying = !audio.paused;
                    updatePlayButton(isPlaying);
                  }
                }
              });

              // Previous
              document.getElementById('prevBtn').addEventListener('click', () => {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ action: 'previous' }, '*');
                }
              });

              // Next
              document.getElementById('nextBtn').addEventListener('click', () => {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ action: 'next' }, '*');
                }
              });

              // Seek
              document.getElementById('seekBar').addEventListener('input', (e) => {
                if (window.opener && !window.opener.closed) {
                  const audio = window.opener.document.querySelector('audio');
                  if (audio && audio.duration) {
                    audio.currentTime = (e.target.value / 100) * audio.duration;
                  }
                }
              });

              // Volume
              document.getElementById('volumeBar').addEventListener('input', (e) => {
                if (window.opener && !window.opener.closed) {
                  const audio = window.opener.document.querySelector('audio');
                  if (audio) {
                    audio.volume = e.target.value / 100;
                    audio.muted = e.target.value == 0;
                    updateMuteButton(audio.muted || audio.volume === 0);
                  }
                }
              });

              // Mute
              function updateMuteButton(muted) {
                document.getElementById('volumeIcon').style.display = muted ? 'none' : 'block';
                document.getElementById('muteIcon').style.display = muted ? 'block' : 'none';
              }

              document.getElementById('muteBtn').addEventListener('click', () => {
                if (window.opener && !window.opener.closed) {
                  const audio = window.opener.document.querySelector('audio');
                  if (audio) {
                    audio.muted = !audio.muted;
                    updateMuteButton(audio.muted);
                  }
                }
              });

              // Repeat
              document.getElementById('repeatBtn').addEventListener('click', () => {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ action: 'toggleRepeat' }, '*');
                }
              });

              // Queue
              document.getElementById('queueBtn').addEventListener('click', () => {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ action: 'showQueue' }, '*');
                  window.opener.focus();
                }
              });

              // Listen for updates from main window
              window.addEventListener('message', (event) => {
                if (event.data.type === 'songUpdate') {
                  document.getElementById('albumArt').src = event.data.image;
                  document.getElementById('songTitle').textContent = event.data.song;
                  document.getElementById('songArtist').textContent = event.data.artist || 'Unknown Artist';
                  document.title = event.data.song + ' - Music Player';
                }
                if (event.data.type === 'repeatUpdate') {
                  repeatMode = event.data.mode;
                  const btn = document.getElementById('repeatBtn');
                  const indicator = document.getElementById('repeatIndicator');
                  if (repeatMode !== 'none') {
                    btn.classList.add('active');
                    if (repeatMode === 'single') {
                      indicator.style.display = 'flex';
                      indicator.textContent = '1';
                    } else if (repeatMode === 'all') {
                      indicator.style.display = 'flex';
                      indicator.textContent = '∞';
                    }
                  } else {
                    btn.classList.remove('active');
                    indicator.style.display = 'none';
                  }
                }
              });

              // Warn when closing
              window.addEventListener('beforeunload', (e) => {
                e.preventDefault();
                e.returnValue = '';
                return 'Closing this window will stop music controls. Continue?';
              });
            </script>
          </body>
        </html>
      `);
      popup.document.close();

      // Store popup reference
      window.musicPlayerPopup = popup;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 transition-all duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '344px'
        }}
      >
        <div className="bg-gradient-to-r from-amber-600/95 via-orange-500/95 to-amber-600/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Minimized Header */}
          <div className="flex items-center justify-between p-3 select-none">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentSong.image}
                alt={currentSong.song}
                className="w-10 h-10 rounded-lg object-cover border border-white/30 shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-xs truncate">
                  {currentSong.song}
                </h4>
                <p className="text-xs text-white/70 truncate">
                  {currentSong.music || 'Unknown Artist'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all no-drag"
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4 text-white" />
                ) : (
                  <PlayIcon className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>
              <button
                onClick={toggleMinimize}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all no-drag"
              >
                <ArrowsPointingOutIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 transition-all duration-300"
      style={{
        left: '20px',
        bottom: '20px',
        width: '344px',
        maxHeight: 'calc(100vh - 320px)'
      }}
    >
      <div className="bg-gradient-to-br from-amber-600/95 via-orange-500/95 to-amber-600/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-y-auto flex flex-col">
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none rounded-2xl"></div>

        {/* Header */}
        <div className="relative px-4 py-3 border-b border-white/20 select-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full transition-all no-drag flex items-center justify-center"
                title="Close"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L7 7M7 1L1 7"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={toggleMinimize}
                className="w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all no-drag flex items-center justify-center"
                title="Minimize"
              >
                <svg
                  width="8"
                  height="2"
                  viewBox="0 0 8 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 1H8"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={openInNewWindow}
                className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full transition-all no-drag flex items-center justify-center"
                title="Open in New Window"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4L4 1M4 1L7 4M4 1V7"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <h3 className="text-white/90 text-xs font-semibold absolute left-1/2 transform -translate-x-1/2">
            Now Playing
          </h3>
        </div>

        {/* Album Art */}
        <div className="relative flex-shrink-0 p-4 flex justify-center items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <img
              src={currentSong.image}
              alt={currentSong.song}
              className={`relative w-40 h-40 rounded-xl object-cover border-2 border-white/30 shadow-2xl transition-transform duration-300 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: '20px',
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1s'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Song Info */}
        <div className="relative px-4 pb-3 text-center">
          <h2 className="text-white font-bold text-sm truncate drop-shadow-md">
            {currentSong.song}
          </h2>
          <p className="text-white/80 text-xs truncate">
            {currentSong.music || 'Unknown Artist'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative px-4 pb-3 no-drag">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/80 font-mono w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 group relative">
              <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="relative w-full h-2 bg-black/20 rounded-full appearance-none cursor-pointer border border-white/20"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #fef3c7 ${progress}%, rgba(0,0,0,0.2) ${progress}%, rgba(0,0,0,0.2) 100%)`
                }}
              />
            </div>
            <span className="text-xs text-white/80 font-mono w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="relative px-4 pb-3 no-drag">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-all border backdrop-blur-sm ${
                isShuffle
                  ? 'bg-white/30 border-white/50 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
              }`}
              title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-lg transition-all border backdrop-blur-sm ${
                repeatMode !== 'none'
                  ? 'bg-white/30 border-white/50 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <div className="relative">
                <ArrowPathIcon className="w-5 h-5" />
                {repeatMode === 'single' && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-white text-orange-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    1
                  </span>
                )}
                {repeatMode === 'all' && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-white text-orange-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    ∞
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={playPrevious}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40 hover:scale-110 backdrop-blur-sm group"
            >
              <BackwardIcon className="w-5 h-5 text-white/90 group-hover:text-white transition-all transform group-hover:-translate-x-0.5" />
            </button>

            <button
              onClick={togglePlay}
              className="relative p-4 bg-white hover:bg-white/90 rounded-full transition-all shadow-2xl hover:scale-110 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              {isPlaying ? (
                <PauseIcon className="relative w-6 h-6 text-orange-600 transition-transform group-hover:scale-110" />
              ) : (
                <PlayIcon className="relative w-6 h-6 text-orange-600 ml-0.5 transition-transform group-hover:scale-110" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40 hover:scale-110 backdrop-blur-sm group"
            >
              <ForwardIcon className="w-5 h-5 text-white/90 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={handleLikeSong}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40 hover:scale-110 backdrop-blur-sm group"
              title={isLiked ? 'Liked' : 'Like this song'}
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-white/90 group-hover:text-red-400 transition-colors" />
              )}
            </button>

            <button
              onClick={() => setShowNowPlaying(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40 hover:scale-110 backdrop-blur-sm"
            >
              <QueueListIcon className="w-5 h-5 text-white/90" />
            </button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="relative px-4 pb-4 no-drag">
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={toggleMute}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40 backdrop-blur-sm"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5 text-white/90" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5 text-white/90" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-black/20 rounded-full appearance-none cursor-pointer border border-white/20"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #fef3c7 ${
                  isMuted ? 0 : volume * 100
                }%, rgba(0,0,0,0.2) ${
                  isMuted ? 0 : volume * 100
                }%, rgba(0,0,0,0.2) 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;

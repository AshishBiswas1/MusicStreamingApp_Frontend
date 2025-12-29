import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const PodcastPlayer = ({
  currentEpisode,
  podcastInfo,
  allEpisodes,
  isPlaying,
  onClose,
  onPlayPause,
  onNext,
  onPrevious
}) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight - 520 : 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (onNext) onNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  // Load and play episode
  useEffect(() => {
    if (currentEpisode && audioRef.current) {
      audioRef.current.src = currentEpisode.audio;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
      }
    }
  }, [currentEpisode]);

  // Play/pause sync
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Playback error:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentEpisode) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentEpisode.title,
        artist: podcastInfo?.title || 'Podcast',
        album: podcastInfo?.publisher || '',
        artwork: [
          {
            src: podcastInfo?.image || '',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', onPlayPause);
      navigator.mediaSession.setActionHandler('pause', onPlayPause);
      navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, [currentEpisode, podcastInfo, onPlayPause, onNext, onPrevious]);

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

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, duration)
      );
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentEpisode) return null;

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 transition-all duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '320px'
        }}
      >
        <div className="bg-gradient-to-r from-purple-600/95 via-pink-500/95 to-purple-600/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
          <div
            className="flex items-center justify-between p-3 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={podcastInfo?.image}
                alt={podcastInfo?.title}
                className="w-10 h-10 rounded-lg object-cover border border-white/30 shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-xs truncate">
                  {currentEpisode.title}
                </h4>
                <p className="text-xs text-white/70 truncate">
                  {podcastInfo?.title || 'Podcast'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onPlayPause}
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
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: '520px'
      }}
    >
      <div className="h-full bg-gradient-to-br from-purple-600/95 via-pink-500/95 to-purple-600/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden flex flex-col">
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none rounded-2xl"></div>

        {/* Header with drag handle */}
        <div
          className="relative px-4 py-3 border-b border-white/20 cursor-move select-none flex items-center justify-between"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full transition-all no-drag"
                title="Close"
              ></button>
              <button
                onClick={toggleMinimize}
                className="w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all no-drag"
                title="Minimize"
              ></button>
            </div>
          </div>
          <h3 className="text-white/90 text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
            Podcast Player
          </h3>
          <div className="text-xs text-white/60">🎙️</div>
        </div>

        {/* Podcast/Episode Art */}
        <div className="relative flex-shrink-0 p-6 flex justify-center items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-300 to-pink-300 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <img
              src={podcastInfo?.image}
              alt={podcastInfo?.title}
              className={`relative w-48 h-48 rounded-2xl object-cover border-4 border-white/30 shadow-2xl transition-transform duration-300 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: '24px',
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

        {/* Episode Info */}
        <div className="relative px-6 pb-3 text-center">
          <h2 className="text-white font-bold text-base truncate drop-shadow-md mb-1">
            {currentEpisode.title}
          </h2>
          <p className="text-white/80 text-sm truncate">
            {podcastInfo?.title || 'Podcast'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative px-6 pb-3 no-drag">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-white/80 font-mono w-14 text-right">
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
                  background: `linear-gradient(to right, #ffffff 0%, #fce7f3 ${progress}%, rgba(0,0,0,0.2) ${progress}%, rgba(0,0,0,0.2) 100%)`
                }}
              />
            </div>
            <span className="text-xs text-white/80 font-mono w-14">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="relative px-6 pb-3 no-drag">
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={() => skip(-15)}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-lg transition-all border border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg"
              title="Rewind 15s"
            >
              <span className="text-white text-sm font-bold">-15</span>
            </button>

            <button
              onClick={onPrevious}
              className="flex-shrink-0 p-3 bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/30 hover:border-white/50 hover:scale-110 backdrop-blur-sm group shadow-lg"
              disabled={!onPrevious}
            >
              <BackwardIcon className="w-5 h-5 text-white group-hover:text-white transition-all" />
            </button>

            <button
              onClick={onPlayPause}
              className="relative p-4 bg-white hover:bg-white/95 rounded-full transition-all shadow-2xl hover:scale-110 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              {isPlaying ? (
                <PauseIcon className="relative w-7 h-7 text-purple-600 transition-transform group-hover:scale-110" />
              ) : (
                <PlayIcon className="relative w-7 h-7 text-purple-600 ml-0.5 transition-transform group-hover:scale-110" />
              )}
            </button>

            <button
              onClick={onNext}
              className="flex-shrink-0 p-3 bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/30 hover:border-white/50 hover:scale-110 backdrop-blur-sm group shadow-lg"
              disabled={!onNext}
            >
              <ForwardIcon className="w-5 h-5 text-white group-hover:text-white transition-all" />
            </button>

            <button
              onClick={() => skip(30)}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-lg transition-all border border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg"
              title="Forward 30s"
            >
              <span className="text-white text-sm font-bold">+30</span>
            </button>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center justify-center mb-2">
            <button
              onClick={cyclePlaybackRate}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-lg transition-all border border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg"
              title="Playback Speed"
            >
              <span className="text-white text-sm font-bold">
                Speed: {playbackRate}x
              </span>
            </button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="relative px-6 pb-4 no-drag">
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={toggleMute}
              className="p-2.5 bg-white/15 hover:bg-white/25 rounded-lg transition-all border border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5 text-white" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              className="w-32 h-2 bg-black/30 rounded-full appearance-none cursor-pointer border border-white/30 shadow-inner"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #fce7f3 ${
                  isMuted ? 0 : volume * 100
                }%, rgba(0,0,0,0.3) ${
                  isMuted ? 0 : volume * 100
                }%, rgba(0,0,0,0.3) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default PodcastPlayer;

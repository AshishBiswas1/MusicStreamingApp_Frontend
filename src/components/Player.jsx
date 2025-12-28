import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon
} from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Player = ({
  currentSong,
  isPlaying,
  togglePlay,
  playNext,
  playPrevious,
  audioRef,
  setShowNowPlaying,
  onClose
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef]);

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

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      {/* Solid opaque background with glassy effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/95 via-orange-500/95 to-amber-600/95 backdrop-blur-xl"></div>

      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none"></div>

      {/* Content wrapper */}
      <div className="relative px-6 py-3 border-t border-white/30 shadow-2xl shadow-black/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/20 hover:border-red-400/50 z-10 backdrop-blur-sm"
          title="Close player"
        >
          <XMarkIcon className="w-4 h-4 text-white/90 group-hover:text-red-300 transition-colors" />
        </button>

        <div className="max-w-screen-2xl mx-auto flex items-center gap-6">
          {/* Song Info */}
          <div className="flex items-center gap-3 w-72">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-lg blur opacity-40"></div>
              <img
                src={currentSong.image}
                alt={currentSong.song}
                className="relative w-14 h-14 rounded-lg shadow-xl border border-white/30 object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm truncate drop-shadow-md">
                {currentSong.song}
              </h4>
              <p className="text-xs text-white/80 truncate">
                {currentSong.music || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {/* Buttons */}
            <div className="flex items-center gap-5">
              <button
                onClick={playPrevious}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/20 hover:border-white/40 hover:scale-110 backdrop-blur-sm"
              >
                <BackwardIcon className="w-5 h-5 text-white/90 group-hover:text-white transition-colors drop-shadow-md" />
              </button>

              <button
                onClick={togglePlay}
                className="relative p-3 bg-white/90 hover:bg-white rounded-full transition-all shadow-xl hover:scale-110 group border border-white/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                {isPlaying ? (
                  <PauseIcon className="relative w-5 h-5 text-orange-600" />
                ) : (
                  <PlayIcon className="relative w-5 h-5 text-orange-600 ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/20 hover:border-white/40 hover:scale-110 backdrop-blur-sm"
              >
                <ForwardIcon className="w-5 h-5 text-white/90 group-hover:text-white transition-colors drop-shadow-md" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-white/80 w-10 text-right font-mono drop-shadow-md">
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
                  className="relative w-full h-1.5 bg-black/20 rounded-full appearance-none cursor-pointer border border-white/20 backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #fef3c7 ${progress}%, rgba(0,0,0,0.2) ${progress}%, rgba(0,0,0,0.2) 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-white/80 w-10 font-mono drop-shadow-md">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center gap-3 w-72 justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                {isMuted || volume === 0 ? (
                  <SpeakerXMarkIcon className="w-4 h-4 text-white/90 group-hover:text-red-300 transition-colors drop-shadow-md" />
                ) : (
                  <SpeakerWaveIcon className="w-4 h-4 text-white/90 group-hover:text-white transition-colors drop-shadow-md" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 bg-black/20 rounded-full appearance-none cursor-pointer border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #fef3c7 ${
                    isMuted ? 0 : volume * 100
                  }%, rgba(0,0,0,0.2) ${
                    isMuted ? 0 : volume * 100
                  }%, rgba(0,0,0,0.2) 100%)`
                }}
              />
            </div>

            <button
              onClick={() => setShowNowPlaying(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/20 hover:border-white/40 hover:scale-110 hover:shadow-lg backdrop-blur-sm"
            >
              <QueueListIcon className="w-5 h-5 text-white/90 group-hover:text-white transition-colors drop-shadow-md" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;

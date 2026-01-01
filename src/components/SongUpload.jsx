import React, { useState } from 'react';
import {
  XMarkIcon,
  MusicalNoteIcon,
  PhotoIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { musicService } from '../api/musicService';

const SongUpload = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    song: '',
    year: '',
    label: '',
    copyright_text: ''
  });
  const [musicFile, setMusicFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [musicPreview, setMusicPreview] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMusicFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMusicFile(file);
      setMusicPreview(file.name);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!musicFile) {
      setError('Please select a music file');
      return;
    }

    if (!formData.song) {
      setError('Please enter a song name');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('music', musicFile);
      if (imageFile) {
        data.append('image', imageFile);
      }
      data.append('song', formData.song);
      if (formData.year) data.append('year', formData.year);
      if (formData.label) data.append('label', formData.label);
      if (formData.copyright_text)
        data.append('copyright_text', formData.copyright_text);

      await musicService.uploadSong(data);
      setSuccess('Song uploaded successfully!');

      // Reset form
      setFormData({
        song: '',
        year: '',
        label: '',
        copyright_text: ''
      });
      setMusicFile(null);
      setImageFile(null);
      setMusicPreview('');
      setImagePreview('');

      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData({
        song: '',
        year: '',
        label: '',
        copyright_text: ''
      });
      setMusicFile(null);
      setImageFile(null);
      setMusicPreview('');
      setImagePreview('');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-gray-800 to-gray-900 z-10 flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Song</h2>
            <p className="text-sm text-gray-400 mt-1">
              Add a new track to the library
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Music File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Music File <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleMusicFileChange}
                disabled={uploading}
                className="hidden"
                id="music-file"
              />
              <label
                htmlFor="music-file"
                className="flex items-center justify-center gap-3 p-4 bg-gray-800 border-2 border-dashed border-gray-600 hover:border-cyan-500/50 rounded-lg cursor-pointer transition-all disabled:opacity-50"
              >
                <MusicalNoteIcon className="w-8 h-8 text-cyan-400" />
                <div className="text-center">
                  <p className="text-white font-medium">
                    {musicPreview || 'Choose music file'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    MP3, WAV, FLAC supported
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Image File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Album Art (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploading}
                className="hidden"
                id="image-file"
              />
              <label
                htmlFor="image-file"
                className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-dashed border-gray-600 hover:border-cyan-500/50 rounded-lg cursor-pointer transition-all"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-cyan-400" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {imageFile ? imageFile.name : 'Choose album art'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP supported
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Song Name */}
          <div>
            <label
              htmlFor="song"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Song Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="song"
              name="song"
              value={formData.song}
              onChange={handleInputChange}
              disabled={uploading}
              placeholder="Enter song name"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Year (Optional)
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              disabled={uploading}
              placeholder="e.g., 2024"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Label */}
          <div>
            <label
              htmlFor="label"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Label (Optional)
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              disabled={uploading}
              placeholder="e.g., Sony Music"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Copyright Text */}
          <div>
            <label
              htmlFor="copyright_text"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Copyright Text (Optional)
            </label>
            <textarea
              id="copyright_text"
              name="copyright_text"
              value={formData.copyright_text}
              onChange={handleInputChange}
              disabled={uploading}
              placeholder="Enter copyright information"
              rows="3"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  Upload Song
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongUpload;

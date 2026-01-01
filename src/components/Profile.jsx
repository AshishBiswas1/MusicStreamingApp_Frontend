import React, { useState } from 'react';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  MusicalNoteIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import SongUpload from './SongUpload';

const Profile = ({ onBack }) => {
  const { user, logout, setUser } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    onBack();
  };

  const handleImageChange = (e) => {
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

  const handleStartEdit = () => {
    setEditName(user?.name || '');
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(user?.name || '');
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    if (!editName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();

      if (editName !== user?.name) {
        formData.append('name', editName.trim());
      }

      if (imageFile) {
        formData.append('profile_image', imageFile);
      }

      // Check if there's anything to update
      if (!imageFile && editName === user?.name) {
        setError('No changes to save');
        setUpdating(false);
        return;
      }

      const response = await authService.updateMe(formData);

      // Update user context with new data
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-32">
      <SongUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          // Optionally refresh song list or show success message
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-400 mt-1">Manage your account settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg transition-all"
          >
            <PencilIcon className="w-5 h-5" />
            <span className="font-medium">Edit Profile</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-4xl mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-4xl mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-4xl">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              {imagePreview || user?.profile ? (
                <img
                  src={imagePreview || user.profile}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-500/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-cyan-500/30 flex items-center justify-center">
                  <UserCircleIcon className="w-16 h-16 text-cyan-400" />
                </div>
              )}
              {isAdmin && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-2">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="profile-image"
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
                >
                  <PhotoIcon className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-xl font-bold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-gray-400 text-lg">{user?.email}</p>
                  <p className="text-gray-500 text-sm">
                    Member since {formatDate(user?.created_at)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg transition-all"
                    >
                      {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">
                      {user?.name}
                    </h2>
                    {isAdmin && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-lg mb-1">{user?.email}</p>
                  <p className="text-gray-500 text-sm">
                    Member since {formatDate(user?.created_at)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-700/50">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Account Type</p>
              <p className="text-white font-medium">
                {isAdmin ? 'Administrator' : 'Standard User'}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">User ID</p>
              <p className="text-white font-medium font-mono text-xs">
                {user?.id}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-green-400 font-medium">Active</p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/30 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Admin Actions</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Manage the music library and platform content
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              <MusicalNoteIcon className="w-5 h-5" />
              <span className="font-medium">Upload New Song</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

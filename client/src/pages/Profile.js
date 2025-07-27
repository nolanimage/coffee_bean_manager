import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Save, Eye, EyeOff, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import FormField from '../components/FormField';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      email: user?.email || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm();

  const newPassword = watchPassword('newPassword');

  const onSubmitProfile = async (data) => {
    try {
      setIsSubmitting(true);
      
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user;
      
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setIsSubmitting(true);
      
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      
      setIsChangingPassword(false);
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      email: user?.email || ''
    });
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    resetPassword();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-coffee-gradient rounded-full flex items-center justify-center shadow-glow mb-4">
          <Coffee className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-coffee-600" />
              <span>Profile Information</span>
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  name="first_name"
                  type="text"
                  register={register}
                  validation={{ required: 'First name is required' }}
                  placeholder="John"
                  required
                  error={errors.first_name?.message}
                />
                <FormField
                  label="Last Name"
                  name="last_name"
                  type="text"
                  register={register}
                  validation={{ required: 'Last name is required' }}
                  placeholder="Doe"
                  required
                  error={errors.last_name?.message}
                />
              </div>

              <FormField
                label="Username"
                name="username"
                type="text"
                register={register}
                validation={{ 
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                }}
                placeholder="johndoe"
                required
                error={errors.username?.message}
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                register={register}
                validation={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                placeholder="your@email.com"
                required
                disabled
                error={errors.email?.message}
                helperText="Email cannot be changed"
              />

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <p className="text-gray-900">{user?.first_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <p className="text-gray-900">{user?.last_name || 'Not set'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <p className="text-gray-900">{user?.username || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Password Change */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-coffee-600" />
              <span>Security</span>
            </h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn btn-secondary text-sm"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                  <span className="text-danger-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Enter current password"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                  <span className="text-danger-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Enter new password"
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                  <span className="text-danger-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    {...registerPassword('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Changing...' : 'Change Password'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <p className="text-gray-900">••••••••</p>
                <p className="text-sm text-gray-500 mt-1">Last changed: Recently</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <p className="text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 
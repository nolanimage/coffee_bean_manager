import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Coffee, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const response = await authAPI.resetPassword(token, data.password);
      const result = response.data;

      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-glow mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-gray-600">Your password has been successfully reset</p>
          </div>

          {/* Success Message */}
          <div className="card">
            <div className="text-center space-y-4">
              <Lock className="w-12 h-12 text-coffee-400 mx-auto" />
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  You can now sign in with your new password.
                </p>
              </div>
            </div>

            {/* Go to Login */}
            <div className="mt-6">
              <Link
                to="/login"
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Welcome back to Coffee Beans! ☕</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-glow mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600">This password reset link is invalid or has expired</p>
          </div>

          <div className="card">
            <Link
              to="/forgot-password"
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <span>Request New Reset Link</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-coffee-gradient rounded-full flex items-center justify-center shadow-glow mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {/* Reset Password Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Password
                <span className="text-danger-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
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
                  placeholder="Confirm your new password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
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
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link
              to="/login"
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Remember your password? <Link to="/login" className="text-coffee-600 hover:text-coffee-700 font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Coffee, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import FormField from '../components/FormField';

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const response = await authAPI.forgotPassword(data.email);
      const result = response.data;

      setIsSuccess(true);
      setResetToken(result.resetToken); // For testing purposes
      toast.success('Password reset link sent!');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send reset email';
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600">We've sent a password reset link to your email</p>
          </div>

          {/* Success Message */}
          <div className="card">
            <div className="text-center space-y-4">
              <Mail className="w-12 h-12 text-coffee-400 mx-auto" />
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Click the link in your email to reset your password. The link will expire in 1 hour.
                </p>
                
                {/* For testing purposes - remove in production */}
                {resetToken && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-xs text-gray-500 mb-2">For testing purposes:</p>
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="text-coffee-600 hover:text-coffee-700 text-sm font-medium"
                    >
                      Click here to reset password
                    </Link>
                  </div>
                )}
              </div>
            </div>

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
            <p>Didn't receive the email? Check your spam folder</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">Enter your email to reset your password</p>
        </div>

        {/* Forgot Password Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Email Address"
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
              error={errors.email?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
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

export default ForgotPassword; 
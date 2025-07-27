import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Coffee, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import FormField from '../components/FormField';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const response = await authAPI.register(data);
      const result = response.data;

      // Use AuthContext to login after successful registration
      login(result.user, result.token);
      
      toast.success('Account created successfully! ☕');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-coffee-gradient rounded-full flex items-center justify-center shadow-glow mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join the coffee bean community</p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              error={errors.email?.message}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
                <span className="text-danger-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="Enter your password"
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
                Confirm Password
                <span className="text-danger-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="Confirm your password"
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
              <User className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="btn btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Start your coffee journey today ☕</p>
        </div>
      </div>
    </div>
  );
};

export default Register; 
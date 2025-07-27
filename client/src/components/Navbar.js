import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ navigation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto mobile-padding">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coffee-gradient rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg sm:text-xl">☕</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Coffee Bean Manager</span>
                <p className="text-xs sm:text-sm text-gray-500 leading-tight hidden sm:block">Your perfect brew companion</p>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-7 h-7 bg-coffee-100 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-coffee-600" />
                </div>
                <span className="hidden sm:block">
                  {user?.first_name || user?.username || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="w-7 h-7 bg-coffee-100 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-coffee-600" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-medium">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'nav-link-active'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Profile Settings */}
            <Link
              to="/profile"
              className="flex items-center space-x-4 px-4 py-4 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 
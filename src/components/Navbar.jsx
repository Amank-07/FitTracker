import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/authService';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/workouts', label: 'Workouts', icon: '🏋️' },
    { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
    { path: '/progress', label: 'Progress', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutUser();
      if (result.success) {
        onLogout();
      } else {
        console.error('Logout failed:', result.error);
        // Still call onLogout to clear local state
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still call onLogout to clear local state
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-slate-800 shadow-md border-b border-slate-700 nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                🏃‍♂️
              </div>
              <div>
                <span className="text-2xl font-bold text-white neon-glow">FitTracker</span>
                <div className="text-xs text-white/70">Health & Fitness</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 ml-16">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${
                  isActive(item.path) ? 'active' : ''
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="avatar-glow">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="avatar">
                    <span>{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                )}
              </div>
              <div className="text-white">
                <div className="font-semibold">{user?.name || 'User'}</div>
                <div className="text-xs text-white/70">Fitness Enthusiast</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn-secondary text-sm hidden md:block"
            >
              {isLoggingOut ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging out...
                </div>
              ) : (
                'Logout'
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 glass-dark">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-item ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="flex items-center space-x-3 px-4 py-3 border-t border-white/20 mt-4 pt-4">
                <div className="avatar-glow">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <div className="font-semibold">{user?.name || 'User'}</div>
                  <div className="text-xs text-white/70">Fitness Enthusiast</div>
                </div>
              </div>

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                disabled={isLoggingOut}
                className="btn-secondary text-sm mx-4"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging out...
                  </div>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
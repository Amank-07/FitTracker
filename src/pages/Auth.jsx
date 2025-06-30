import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    height: '',
    weight: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login with Firebase
        const result = await loginUser(formData.email, formData.password);
        
        if (result.success) {
          onLogin(result.user);
        } else {
          setError(result.error);
        }
      } else {
        // Register with Firebase
        const userData = {
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          height: formData.height ? parseInt(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null
        };

        const result = await registerUser(formData.email, formData.password, userData);
        
        if (result.success) {
          onLogin(result.user);
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏃‍♂️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to FitTracker
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your fitness journey'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
                minLength="6"
              />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Age"
                      min="1"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Height"
                      min="100"
                      max="250"
                    />
                  </div>
                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Weight"
                      min="30"
                      max="300"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="message error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    age: '',
                    height: '',
                    weight: ''
                  });
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Firebase Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by Firebase Authentication</p>
          <p className="mt-2">Secure, scalable, and reliable</p>
        </div>
      </div>
    </div>
  );
};

export default Auth; 
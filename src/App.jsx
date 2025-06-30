import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import DataTest from './components/DataTest';
import { onAuthStateChange, getCurrentUser } from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User'
        });
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
      
      <main className={`${isAuthenticated ? 'pt-20' : 'pt-0'} relative z-10`}>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Home user={user} /> : 
                <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="/workouts" 
            element={
              isAuthenticated ? 
                <Workouts user={user} /> : 
                <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              isAuthenticated ? 
                <Nutrition user={user} /> : 
                <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="/progress" 
            element={
              isAuthenticated ? 
                <Progress user={user} /> : 
                <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
                <Profile user={user} updateUser={updateUser} /> : 
                <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="/test" 
            element={
              isAuthenticated ? 
                <DataTest user={user} /> : 
                <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <Auth onLogin={handleLogin} />
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App; 
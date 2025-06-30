import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChatBot from '../components/ChatBot';

const Home = ({ user }) => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    currentStreak: 0,
    weeklyProgress: 0
  });

  const [showChatBot, setShowChatBot] = useState(false);

  const handleChatBotToggle = () => {
    console.log('ChatBot button clicked, current state:', showChatBot);
    setShowChatBot(!showChatBot);
    console.log('ChatBot state set to:', !showChatBot);
  };

  useEffect(() => {
    // Load user stats from localStorage
    const loadStats = () => {
      const completedWorkouts = JSON.parse(localStorage.getItem(`workouts_${user.id}`) || '[]');
      const meals = JSON.parse(localStorage.getItem(`meals_${user.id}`) || '[]');
      const progressLogs = JSON.parse(localStorage.getItem(`progress_${user.id}`) || '[]');

      const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const currentStreak = calculateStreak(completedWorkouts);
      const weeklyProgress = calculateWeeklyProgress(progressLogs);

      setStats({
        totalWorkouts: completedWorkouts.length,
        totalCalories,
        currentStreak,
        weeklyProgress
      });
    };

    loadStats();
  }, [user.id]);

  const calculateStreak = (workouts) => {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts
      .map(w => new Date(w.completedAt))
      .sort((a, b) => b - a);
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedWorkouts.length - 1; i++) {
      const current = new Date(sortedWorkouts[i]);
      const next = new Date(sortedWorkouts[i + 1]);
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      
      const diffDays = (current - next) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateWeeklyProgress = (logs) => {
    if (logs.length === 0) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentLogs = logs.filter(log => new Date(log.date) >= oneWeekAgo);
    return recentLogs.length;
  };

  const features = [
    {
      title: 'Track Workouts',
      description: 'Log your exercises and track your fitness progress',
      icon: '💪',
      path: '/workouts',
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-400/20 to-blue-600/20'
    },
    {
      title: 'Log Nutrition',
      description: 'Monitor your daily calorie and macro intake',
      icon: '🥗',
      path: '/nutrition',
      color: 'from-green-500 to-green-600',
      gradient: 'from-green-400/20 to-green-600/20'
    },
    {
      title: 'Monitor Progress',
      description: 'Visualize your fitness journey with charts',
      icon: '📊',
      path: '/progress',
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-400/20 to-purple-600/20'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ChatBot Button - Fixed Position */}
        <button
          onClick={handleChatBotToggle}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          title="Chat with AI Fitness Assistant"
        >
          <div className="relative">
            <span className="text-2xl">🤖</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">
            Chat with AI Assistant
          </div>
        </button>

        {/* Welcome Section */}
        <section className="relative w-full min-h-[400px] py-16 mb-12 fade-in overflow-hidden">
          {/* Full-width Confetti/Sparkle Background */}
          <div className="absolute inset-0 w-full h-full sparkle-bg pointer-events-none z-0"></div>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="text-8xl mb-4 animate-bounce-slow drop-shadow-lg">🏃‍♂️</div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg text-center">
              Welcome back, <span className="px-2 py-1 rounded-xl text-white">{user.name}</span>! 👋
            </h1>
            <p className="text-2xl font-semibold text-white mb-2 drop-shadow-md text-center">
              Ready to crush your fitness goals today?
            </p>
            <p className="text-lg text-white/90 mb-8 drop-shadow text-center">
              Track your workouts, monitor your nutrition, and watch your progress soar with our comprehensive fitness tracking platform!
            </p>
            <Link to="/workouts" className="btn-primary text-lg px-8 py-4 shadow-xl hover:scale-105 transition-transform duration-300">
              🚀 Start Your Journey
            </Link>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-indigo-500">💪</div>
            <div className="text-4xl font-bold text-indigo-600">{stats.totalWorkouts}</div>
            <div className="text-gray-600">Workouts Completed</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-orange-500">🔥</div>
            <div className="text-4xl font-bold text-orange-600">{stats.totalCalories}</div>
            <div className="text-gray-600">Calories Logged</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-green-500">⚡</div>
            <div className="text-4xl font-bold text-green-600">{stats.currentStreak}</div>
            <div className="text-gray-600">Day Streak</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-purple-500">📈</div>
            <div className="text-4xl font-bold text-purple-600">{stats.weeklyProgress}</div>
            <div className="text-gray-600">Weekly Logs</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid-responsive mb-12">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className="feature-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Get Started →
              </div>
            </Link>
          ))}
        </div>

        {/* AI Assistant Feature Card */}
        <div className="mb-12">
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Fitness Assistant</h2>
              <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                Get personalized fitness guidance powered by ChatGPT! Ask questions about workouts, 
                nutrition, motivation, and get expert advice tailored to your goals.
              </p>
              <button
                onClick={handleChatBotToggle}
                className="btn-primary text-lg px-8 py-4 group"
              >
                <span className="flex items-center">
                  💬 Chat with AI Assistant
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Motivation Section */}
        <div className="card nutrition-gradient mb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 text-white">
              💪 Stay Motivated!
            </h2>
            <p className="text-xl mb-8 opacity-90 text-white leading-relaxed">
              Consistency is the key to success. Every workout, every meal, every step counts towards your goals.
              <br />
              <span className="font-semibold">Your future self will thank you!</span>
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/workouts"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30"
              >
                🏋️‍♂️ Start Workout
              </Link>
              <Link
                to="/nutrition"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30"
              >
                🥗 Log Meal
              </Link>
              <button
                onClick={handleChatBotToggle}
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30"
              >
                🤖 Get AI Guidance
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="gradient-heading text-center mb-8">Recent Activity</h2>
          <div className="card">
            <div className="space-y-4">
              {stats.totalWorkouts > 0 ? (
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                      💪
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">Workout Completed</p>
                      <p className="text-gray-600">Great job on your latest workout! Keep up the momentum!</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                    Today
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6 animate-pulse-slow">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No recent activity yet</h3>
                  <p className="text-gray-600 mb-8 text-lg">Start your fitness journey by completing your first workout!</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link
                      to="/workouts"
                      className="btn-primary text-lg px-8 py-4"
                    >
                      Start Your First Workout
                    </Link>
                    <button
                      onClick={handleChatBotToggle}
                      className="btn-secondary text-lg px-8 py-4"
                    >
                      🤖 Get AI Guidance
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/progress"
              className="btn-secondary text-lg px-6 py-3"
            >
              📊 View Progress
            </Link>
            <Link
              to="/profile"
              className="btn-secondary text-lg px-6 py-3"
            >
              👤 Update Profile
            </Link>
            <button
              onClick={handleChatBotToggle}
              className="btn-primary text-lg px-6 py-3"
            >
              🤖 AI Assistant
            </button>
          </div>
        </div>

        {/* ChatBot Modal */}
        {showChatBot && (
          <ChatBot 
            user={user} 
            onClose={handleChatBotToggle} 
          />
        )}
      </div>
    </div>
  );
};

export default Home; 
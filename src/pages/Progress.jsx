import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Progress = ({ user }) => {
  const [progressLogs, setProgressLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [message, setMessage] = useState('');

  const [logFormData, setLogFormData] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [goalFormData, setGoalFormData] = useState({
    title: '',
    targetValue: '',
    currentValue: '',
    deadline: '',
    metric: 'weight'
  });

  const metrics = [
    { value: 'weight', label: 'Weight (kg)', icon: '⚖️' },
    { value: 'steps', label: 'Steps', icon: '👟' },
    { value: 'bodyFat', label: 'Body Fat %', icon: '📊' },
    { value: 'muscleMass', label: 'Muscle Mass (kg)', icon: '💪' },
    { value: 'custom', label: 'Custom Metric', icon: '📈' }
  ];

  useEffect(() => {
    // Load progress logs and goals from localStorage
    const savedLogs = JSON.parse(localStorage.getItem(`progress_${user.id}`) || '[]');
    const savedGoals = JSON.parse(localStorage.getItem(`goals_${user.id}`) || '[]');
    setProgressLogs(savedLogs);
    setGoals(savedGoals);
  }, [user.id]);

  const handleLogSubmit = (e) => {
    e.preventDefault();
    
    if (!logFormData.value) {
      setMessage('Please enter a value');
      return;
    }

    const newLog = {
      id: Date.now().toString(),
      metric: selectedMetric,
      value: parseFloat(logFormData.value),
      date: logFormData.date,
      timestamp: new Date().toISOString()
    };

    const updatedLogs = [...progressLogs, newLog];
    setProgressLogs(updatedLogs);
    localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedLogs));

    setLogFormData({
      value: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowLogForm(false);
    setMessage('Progress logged successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    
    if (!goalFormData.title || !goalFormData.targetValue || !goalFormData.currentValue) {
      setMessage('Please fill in all required fields');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      ...goalFormData,
      targetValue: parseFloat(goalFormData.targetValue),
      currentValue: parseFloat(goalFormData.currentValue),
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));

    setGoalFormData({
      title: '',
      targetValue: '',
      currentValue: '',
      deadline: '',
      metric: 'weight'
    });
    setShowGoalForm(false);
    setMessage('Goal created successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteLog = (logId) => {
    const updatedLogs = progressLogs.filter(log => log.id !== logId);
    setProgressLogs(updatedLogs);
    localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedLogs));
    setMessage('Log deleted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
    setMessage('Goal deleted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Prepare chart data for selected metric
  const chartData = progressLogs
    .filter(log => log.metric === selectedMetric)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(log => ({
      date: new Date(log.date).toLocaleDateString(),
      value: log.value
    }));

  // Calculate goal progress
  const calculateGoalProgress = (goal) => {
    const current = goal.currentValue;
    const target = goal.targetValue;
    const start = goal.currentValue; // Assuming current value is the starting point
    
    if (target > start) {
      // Goal is to increase
      return Math.min(100, Math.max(0, ((current - start) / (target - start)) * 100));
    } else {
      // Goal is to decrease
      return Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
    }
  };

  const getMetricIcon = (metric) => {
    const found = metrics.find(m => m.value === metric);
    return found ? found.icon : '📊';
  };

  const getMetricLabel = (metric) => {
    const found = metrics.find(m => m.value === metric);
    return found ? found.label : 'Custom Metric';
  };

  return (
    <div className="min-h-screen bg-[#10172a] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-float">📊</div>
            <h1 className="gradient-heading text-5xl text-indigo-600">
              Progress Tracker
            </h1>
          </div>
          <p className="subtitle text-xl text-gray-200">
            Monitor your fitness journey and track your goals with beautiful visualizations
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'} mb-6`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <button
            onClick={() => setShowLogForm(true)}
            className="btn-primary text-lg px-8 py-4"
          >
            📝 Log Progress
          </button>
          <button
            onClick={() => setShowGoalForm(true)}
            className="btn-secondary text-lg px-8 py-4"
          >
            🎯 Set Goal
          </button>
        </div>

        {/* Metric Selection */}
        <div className="mb-8">
          <label className="form-label text-center block text-lg font-semibold mb-4">Select Metric to View</label>
          <div className="flex flex-wrap justify-center gap-3">
            {metrics.map((metric) => (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedMetric === metric.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-105 shadow-md'
                }`}
              >
                <span className="text-xl">{metric.icon}</span>
                <span>{metric.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="chart-container mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">
            {getMetricIcon(selectedMetric)} {getMetricLabel(selectedMetric)} Progress
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#gradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#667eea', strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 animate-pulse-slow">📈</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No data available</h3>
              <p className="text-gray-600 text-lg mb-8">Start tracking your progress by logging your first entry!</p>
              <button
                onClick={() => setShowLogForm(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Log Your First Entry
              </button>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="mb-12">
          <h2 className="gradient-heading text-center mb-8 text-indigo-600">Your Goals</h2>
          {goals.length > 0 ? (
            <div className="grid-responsive">
              {goals.map((goal) => {
                const progress = calculateGoalProgress(goal);
                
                return (
                  <div key={goal.id} className="card card-hover">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-bold text-gray-800">
                        {goal.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="btn-danger text-sm px-4 py-2"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <span className="font-semibold">Current: {goal.currentValue}</span>
                        <span className="font-semibold">Target: {goal.targetValue}</span>
                      </div>
                      
                      <div className="progress-bar">
                        <div 
                          className="progress-fill progress-animate" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {progress.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-600 ml-2">Complete</span>
                      </div>
                      
                      {goal.deadline && (
                        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg text-center">
                          🗓️ Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6 animate-pulse-slow">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No goals set yet</h3>
              <p className="text-gray-600 mb-8 text-lg">Set your first fitness goal to start tracking your progress!</p>
              <button
                onClick={() => setShowGoalForm(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Set Your First Goal
              </button>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="mb-12">
          <h2 className="gradient-heading text-center mb-8">Recent Progress Logs</h2>
          {progressLogs.length > 0 ? (
            <div className="space-y-4">
              {progressLogs
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
                .map((log) => (
                  <div key={log.id} className="card card-hover">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                          {getMetricIcon(log.metric)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {getMetricLabel(log.metric)}: {log.value}
                          </p>
                          <p className="text-gray-600">
                            📅 {new Date(log.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="btn-danger text-sm px-4 py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6 animate-pulse-slow">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No progress logs yet</h3>
              <p className="text-gray-600 mb-8 text-lg">Start tracking your progress by logging your first entry!</p>
              <button
                onClick={() => setShowLogForm(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Log Your First Progress
              </button>
            </div>
          )}
        </div>

        {/* Log Progress Form */}
        {showLogForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="text-2xl font-bold mb-6">Log Progress</h3>
              <form onSubmit={handleLogSubmit} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Metric</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="form-input"
                  >
                    {metrics.map((metric) => (
                      <option key={metric.value} value={metric.value}>
                        {metric.icon} {metric.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logFormData.value}
                    onChange={(e) => setLogFormData({...logFormData, value: e.target.value})}
                    className="form-input"
                    placeholder="Enter value"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={logFormData.date}
                    onChange={(e) => setLogFormData({...logFormData, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="btn-group">
                  <button type="submit" className="btn-primary">
                    Log Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Set Goal Form */}
        {showGoalForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="text-2xl font-bold mb-6">Set New Goal</h3>
              <form onSubmit={handleGoalSubmit} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Goal Title</label>
                  <input
                    type="text"
                    value={goalFormData.title}
                    onChange={(e) => setGoalFormData({...goalFormData, title: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Lose 5kg"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Metric</label>
                  <select
                    value={goalFormData.metric}
                    onChange={(e) => setGoalFormData({...goalFormData, metric: e.target.value})}
                    className="form-input"
                  >
                    {metrics.map((metric) => (
                      <option key={metric.value} value={metric.value}>
                        {metric.icon} {metric.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Current Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={goalFormData.currentValue}
                      onChange={(e) => setGoalFormData({...goalFormData, currentValue: e.target.value})}
                      className="form-input"
                      placeholder="Current"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={goalFormData.targetValue}
                      onChange={(e) => setGoalFormData({...goalFormData, targetValue: e.target.value})}
                      className="form-input"
                      placeholder="Target"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={goalFormData.deadline}
                    onChange={(e) => setGoalFormData({...goalFormData, deadline: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="btn-group">
                  <button type="submit" className="btn-primary">
                    Set Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress; 
import React, { useState, useEffect, useCallback } from 'react';
import { logWorkout, getWorkoutLogs, deleteWorkoutLog } from '../services/workoutService';

const Workouts = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completedWorkouts, setCompletedWorkouts] = useState([]);

  // Mock workout data
  const workoutsData = [
    // Cardio
    {
      id: 1,
      name: 'Running',
      category: 'Cardio',
      duration: '30 min',
      intensity: 'High',
      description: 'Outdoor or treadmill running for cardiovascular fitness',
      calories: 300
    },
    {
      id: 2,
      name: 'Cycling',
      category: 'Cardio',
      duration: '45 min',
      intensity: 'Medium',
      description: 'Stationary bike or outdoor cycling',
      calories: 250
    },
    {
      id: 3,
      name: 'Jump Rope',
      category: 'Cardio',
      duration: '20 min',
      intensity: 'High',
      description: 'High-intensity cardio with jump rope',
      calories: 200
    },
    {
      id: 4,
      name: 'Swimming',
      category: 'Cardio',
      duration: '40 min',
      intensity: 'Medium',
      description: 'Full-body cardio workout in the pool',
      calories: 350
    },

    // Strength
    {
      id: 5,
      name: 'Push-ups',
      category: 'Strength',
      duration: '15 min',
      intensity: 'Medium',
      description: 'Bodyweight exercise for chest, shoulders, and triceps',
      calories: 100
    },
    {
      id: 6,
      name: 'Squats',
      category: 'Strength',
      duration: '20 min',
      intensity: 'Medium',
      description: 'Lower body strength exercise',
      calories: 120
    },
    {
      id: 7,
      name: 'Deadlifts',
      category: 'Strength',
      duration: '25 min',
      intensity: 'High',
      description: 'Compound exercise for back and legs',
      calories: 180
    },
    {
      id: 8,
      name: 'Bench Press',
      category: 'Strength',
      duration: '30 min',
      intensity: 'High',
      description: 'Upper body strength training',
      calories: 150
    },

    // Flexibility
    {
      id: 9,
      name: 'Stretching',
      category: 'Flexibility',
      duration: '15 min',
      intensity: 'Low',
      description: 'Basic stretching routine for flexibility',
      calories: 50
    },
    {
      id: 10,
      name: 'Mobility Work',
      category: 'Flexibility',
      duration: '20 min',
      intensity: 'Low',
      description: 'Joint mobility and flexibility exercises',
      calories: 60
    },

    // Yoga
    {
      id: 11,
      name: 'Vinyasa Flow',
      category: 'Yoga',
      duration: '45 min',
      intensity: 'Medium',
      description: 'Dynamic yoga sequence with flowing movements',
      calories: 200
    },
    {
      id: 12,
      name: 'Hatha Yoga',
      category: 'Yoga',
      duration: '60 min',
      intensity: 'Low',
      description: 'Gentle yoga focusing on breathing and poses',
      calories: 150
    },
    {
      id: 13,
      name: 'Power Yoga',
      category: 'Yoga',
      duration: '50 min',
      intensity: 'High',
      description: 'Intense yoga workout for strength and flexibility',
      calories: 250
    }
  ];

  const categories = ['All', 'Cardio', 'Strength', 'Flexibility', 'Yoga'];

  const loadCompletedWorkouts = useCallback(async () => {
    try {
      const result = await getWorkoutLogs(user.uid);
      if (result.success) {
        setCompletedWorkouts(result.logs);
      } else {
        console.error('Error loading completed workouts:', result.error);
      }
    } catch (error) {
      console.error('Error in loadCompletedWorkouts:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadCompletedWorkouts();
    }
  }, [user?.uid, loadCompletedWorkouts]);

  const filteredWorkouts = selectedCategory === 'All' 
    ? workoutsData 
    : workoutsData.filter(workout => workout.category === selectedCategory);

  const handleToggleWorkout = async (workoutId) => {
    try {
      const isCompleted = completedWorkouts.some(w => w.workoutId === workoutId.toString());
      
      if (isCompleted) {
        // Remove from completed
        const completedWorkout = completedWorkouts.find(w => w.workoutId === workoutId.toString());
        if (completedWorkout) {
          await deleteWorkoutLog(completedWorkout.id);
          // Immediately update the state to remove the workout
          setCompletedWorkouts(prev => prev.filter(w => w.workoutId !== workoutId.toString()));
        }
      } else {
        // Add to completed
        const workout = workoutsData.find(w => w.id === workoutId);
        const workoutData = {
          workoutId: workout.id.toString(),
          workoutName: workout.name,
          exercises: [workout.name],
          duration: parseInt(workout.duration) || 0,
          caloriesBurned: workout.calories || 0,
          notes: `Completed ${workout.name} workout`
        };

        const result = await logWorkout(user.uid, workoutData);
        if (result.success) {
          await loadCompletedWorkouts();
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const clearAllWorkouts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL workout records? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await getWorkoutLogs(user.uid, 1000);
      if (result.success) {
        const deletePromises = result.logs.map(log => deleteWorkoutLog(log.id));
        await Promise.all(deletePromises);
        setCompletedWorkouts([]);
      }
    } catch (error) {
      console.error('Error deleting workout records:', error.message);
    }
  };

  const isWorkoutCompleted = (workoutId) => {
    return completedWorkouts.some(w => w.workoutId === workoutId.toString());
  };

  return (
    <div className="min-h-screen bg-[#10172a] p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Workouts</h1>
          <p className="text-gray-200">Track your fitness journey and complete workouts</p>
          
          {/* Clear All Records Button */}
          <div className="mt-4">
            <button
              onClick={clearAllWorkouts}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              🗑️ Clear All Workout Records
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Prominent Completed Count */}
        <div className="text-center my-6">
          <span className="text-3xl font-bold text-green-600">
            {completedWorkouts.length}
          </span>
          <span className="ml-2 text-lg text-gray-700">Workouts Completed</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-indigo-500">💪</div>
            <div className="text-4xl font-bold text-indigo-600">{completedWorkouts.length}</div>
            <div className="text-gray-600">Workouts Completed</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-orange-500">🔥</div>
            <div className="text-4xl font-bold text-orange-600">{completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}</div>
            <div className="text-gray-600">Calories Burned</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-2 text-green-500">⚡</div>
            <div className="text-4xl font-bold text-green-600">{completedWorkouts.filter(w => {
              const today = new Date();
              const completedDate = w.completedAt?.toDate ? w.completedAt.toDate() : new Date(w.completedAt);
              return today.toDateString() === completedDate.toDateString();
            }).length}</div>
            <div className="text-gray-600">Today's Workouts</div>
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="grid-responsive">
          {filteredWorkouts.map((workout) => {
            const isCompleted = isWorkoutCompleted(workout.id);
            
            return (
              <div
                key={workout.id}
                className={`workout-card ${isCompleted ? 'completed' : ''}`}
                style={{
                  background: isCompleted 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                  border: isCompleted 
                    ? '2px solid rgba(34, 197, 94, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isCompleted 
                    ? '0 8px 32px rgba(34, 197, 94, 0.25)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isCompleted && (
                  <div className="success-checkmark">✓</div>
                )}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {workout.name}
                  </h3>
                  <span className={`intensity-badge intensity-${workout.intensity.toLowerCase()}`}>
                    {workout.intensity}
                  </span>
                </div>

                <div className="workout-info">
                  <div className="workout-info-item">
                    <span>⏱️</span>
                    <span>{workout.duration}</span>
                  </div>
                  <div className="workout-info-item">
                    <span>🔥</span>
                    <span>{workout.calories} calories</span>
                  </div>
                  <div className="workout-info-item">
                    <span>🏷️</span>
                    <span>{workout.category}</span>
                  </div>
                </div>

                <p className="workout-description">
                  {workout.description}
                </p>

                <button
                  onClick={() => handleToggleWorkout(workout.id)}
                  className={`workout-button ${isCompleted ? 'completed' : 'primary'}`}
                  style={{
                    background: isCompleted 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    boxShadow: isCompleted 
                      ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                      : '0 4px 16px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {isCompleted ? '❌ Unmark as Completed' : 'Mark as Completed'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🏋️‍♂️</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No workouts found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or check back later for new workouts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts; 
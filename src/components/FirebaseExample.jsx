import React, { useState, useEffect } from 'react';
import { 
  addWorkout, 
  getUserWorkouts, 
  logWorkout 
} from '../services/workoutService';
import { 
  logMeal, 
  getUserMeals, 
  getNutritionSummary 
} from '../services/nutritionService';
import { 
  logWeight, 
  getWeightHistory 
} from '../services/progressService';

const FirebaseExample = ({ user }) => {
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load user data on component mount
  useEffect(() => {
    if (user?.uid) {
      loadUserData();
    }
  }, [user?.uid]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load workouts
      const workoutsResult = await getUserWorkouts(user.uid);
      if (workoutsResult.success) {
        setWorkouts(workoutsResult.workouts);
      }

      // Load today's meals
      const today = new Date().toISOString().split('T')[0];
      const mealsResult = await getUserMeals(user.uid, today);
      if (mealsResult.success) {
        setMeals(mealsResult.meals);
      }

      // Load weight history
      const weightResult = await getWeightHistory(user.uid, 10);
      if (weightResult.success) {
        setWeightLogs(weightResult.weightLogs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Example: Add a new workout
  const handleAddWorkout = async () => {
    const workoutData = {
      name: 'Morning Cardio',
      description: '30-minute cardio session',
      exercises: [
        { name: 'Running', duration: 20, calories: 200 },
        { name: 'Jumping Jacks', duration: 10, calories: 100 }
      ],
      duration: 30,
      difficulty: 'medium',
      category: 'cardio'
    };

    try {
      const result = await addWorkout(user.uid, workoutData);
      if (result.success) {
        setMessage('Workout added successfully!');
        loadUserData(); // Reload data
      } else {
        setMessage('Error adding workout: ' + result.error);
      }
    } catch (error) {
      setMessage('Error adding workout');
    }
  };

  // Example: Log a meal
  const handleLogMeal = async () => {
    const mealData = {
      name: 'Chicken Salad',
      type: 'lunch',
      foods: [
        { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        { name: 'Mixed Greens', calories: 20, protein: 2, carbs: 4, fat: 0.2 }
      ],
      totalCalories: 185,
      totalProtein: 33,
      totalCarbs: 4,
      totalFat: 3.8,
      notes: 'Healthy lunch option'
    };

    try {
      const result = await logMeal(user.uid, mealData);
      if (result.success) {
        setMessage('Meal logged successfully!');
        loadUserData(); // Reload data
      } else {
        setMessage('Error logging meal: ' + result.error);
      }
    } catch (error) {
      setMessage('Error logging meal');
    }
  };

  // Example: Log weight
  const handleLogWeight = async () => {
    const weightData = {
      weight: 75.5,
      bodyFat: 15.2,
      muscleMass: 45.8,
      notes: 'Weekly weigh-in'
    };

    try {
      const result = await logWeight(user.uid, weightData);
      if (result.success) {
        setMessage('Weight logged successfully!');
        loadUserData(); // Reload data
      } else {
        setMessage('Error logging weight: ' + result.error);
      }
    } catch (error) {
      setMessage('Error logging weight');
    }
  };

  // Example: Get nutrition summary
  const handleGetNutritionSummary = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const result = await getNutritionSummary(user.uid, today);
      if (result.success) {
        const summary = result.summary;
        setMessage(`Today's nutrition: ${summary.totalCalories} calories, ${summary.totalProtein}g protein`);
      } else {
        setMessage('Error getting nutrition summary: ' + result.error);
      }
    } catch (error) {
      setMessage('Error getting nutrition summary');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Firebase Integration Examples</h2>
      
      {/* Message Display */}
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          {message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={handleAddWorkout}
          className="btn-primary"
        >
          Add Workout
        </button>
        
        <button
          onClick={handleLogMeal}
          className="btn-primary"
        >
          Log Meal
        </button>
        
        <button
          onClick={handleLogWeight}
          className="btn-primary"
        >
          Log Weight
        </button>
        
        <button
          onClick={handleGetNutritionSummary}
          className="btn-primary"
        >
          Get Nutrition Summary
        </button>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workouts */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Workouts</h3>
          {workouts.length > 0 ? (
            <div className="space-y-2">
              {workouts.slice(0, 5).map((workout) => (
                <div key={workout.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{workout.name}</div>
                  <div className="text-sm text-gray-600">
                    {workout.duration} min • {workout.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No workouts yet</p>
          )}
        </div>

        {/* Meals */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
          {meals.length > 0 ? (
            <div className="space-y-2">
              {meals.map((meal) => (
                <div key={meal.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{meal.name}</div>
                  <div className="text-sm text-gray-600">
                    {meal.totalCalories} cal • {meal.type}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No meals logged today</p>
          )}
        </div>

        {/* Weight Logs */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weight History</h3>
          {weightLogs.length > 0 ? (
            <div className="space-y-2">
              {weightLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{log.weight} kg</div>
                  <div className="text-sm text-gray-600">
                    {new Date(log.loggedAt?.toDate()).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No weight logs yet</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">How to Use This Example:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Click "Add Workout" to create a new workout in Firestore</li>
          <li>• Click "Log Meal" to add a meal entry to the database</li>
          <li>• Click "Log Weight" to record a weight measurement</li>
          <li>• Click "Get Nutrition Summary" to see today's nutrition totals</li>
          <li>• Data automatically syncs with Firebase and displays below</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseExample; 
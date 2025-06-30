import React, { useState } from 'react';
import { logMeal } from '../services/nutritionService';
import { logWorkout } from '../services/workoutService';
import { logWeight } from '../services/progressService';

const DataTest = ({ user }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testMealLogging = async () => {
    if (!user?.uid) {
      setMessage('Please login first');
      return;
    }

    setLoading(true);
    try {
      const mealData = {
        name: 'Test Meal',
        type: 'lunch',
        foods: [
          { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
          { name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
        ],
        totalCalories: 295,
        totalProtein: 33.7,
        totalCarbs: 28,
        totalFat: 3.9,
        notes: 'Test meal for Firebase verification'
      };

      const result = await logMeal(user.uid, mealData);
      if (result.success) {
        setMessage('✅ Meal logged successfully! Check Firebase Console → Firestore → meals collection');
      } else {
        setMessage('❌ Error logging meal: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testWorkoutLogging = async () => {
    if (!user?.uid) {
      setMessage('Please login first');
      return;
    }

    setLoading(true);
    try {
      const workoutData = {
        workoutId: 'test-workout-123',
        workoutName: 'Test Workout',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10, calories: 50 },
          { name: 'Squats', sets: 3, reps: 15, calories: 80 }
        ],
        duration: 30,
        caloriesBurned: 130,
        notes: 'Test workout for Firebase verification'
      };

      const result = await logWorkout(user.uid, workoutData);
      if (result.success) {
        setMessage('✅ Workout logged successfully! Check Firebase Console → Firestore → workoutLogs collection');
      } else {
        setMessage('❌ Error logging workout: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testWeightLogging = async () => {
    if (!user?.uid) {
      setMessage('Please login first');
      return;
    }

    setLoading(true);
    try {
      const weightData = {
        weight: 75.5,
        bodyFat: 15.2,
        muscleMass: 45.8,
        notes: 'Test weight log for Firebase verification'
      };

      const result = await logWeight(user.uid, weightData);
      if (result.success) {
        setMessage('✅ Weight logged successfully! Check Firebase Console → Firestore → weightLogs collection');
      } else {
        setMessage('❌ Error logging weight: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Firebase Data Test</h2>
          <p className="text-gray-600">Please login first to test data storage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Firebase Data Storage Test</h2>
        
        {/* User Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Current User:</h3>
          <p className="text-blue-600">Name: {user.name}</p>
          <p className="text-blue-600">Email: {user.email}</p>
          <p className="text-blue-600">UID: {user.uid}</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('✅') ? 'bg-green-100 border border-green-400 text-green-700' : 
            message.includes('❌') ? 'bg-red-100 border border-red-400 text-red-700' : 
            'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testMealLogging}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Testing...' : 'Test Meal Logging'}
          </button>
          
          <button
            onClick={testWorkoutLogging}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Testing...' : 'Test Workout Logging'}
          </button>
          
          <button
            onClick={testWeightLogging}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Testing...' : 'Test Weight Logging'}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">How to Verify Data in Firebase:</h4>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
            <li>2. Select your project: <strong>health-and-fitness-f581c</strong></li>
            <li>3. Click "Firestore Database" in the left sidebar</li>
            <li>4. Click "Data" tab</li>
            <li>5. Look for these collections:
              <ul className="ml-4 mt-1">
                <li>• <strong>meals</strong> - for meal data</li>
                <li>• <strong>workoutLogs</strong> - for workout data</li>
                <li>• <strong>weightLogs</strong> - for weight data</li>
                <li>• <strong>users</strong> - for user profiles</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DataTest; 
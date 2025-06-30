import React, { useState, useEffect } from 'react';
import { logMeal, getUserMeals, updateMeal, deleteMeal } from '../services/nutritionService';

const Nutrition = ({ user }) => {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    mealType: 'Breakfast'
  });
  const [message, setMessage] = useState('');

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    if (user?.uid) {
      loadTodayMeals();
    }
  }, [user?.uid]);

  const loadTodayMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading meals for today:', today, 'User ID:', user.uid);
      
      const result = await getUserMeals(user.uid, today);
      console.log('Meals result:', result);
      
      if (result.success) {
        console.log('Setting meals:', result.meals);
        setMeals(result.meals);
      } else {
        console.error('Error loading meals:', result.error);
        setMessage('Error loading meals: ' + result.error);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      setMessage('Error loading meals: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    if (!formData.name || !formData.calories) {
      setMessage('Please fill in meal name and calories');
      setLoading(false);
      return;
    }

    try {
      if (editingMeal) {
        // Update existing meal
        const mealData = {
          name: formData.name,
          type: formData.mealType.toLowerCase(),
          totalCalories: parseInt(formData.calories) || 0,
          totalProtein: parseInt(formData.protein) || 0,
          totalCarbs: parseInt(formData.carbs) || 0,
          totalFat: parseInt(formData.fats) || 0,
          notes: `Updated meal: ${formData.name}`
        };

        const result = await updateMeal(editingMeal.id, mealData);
        if (result.success) {
          setMessage('Meal updated successfully!');
          loadTodayMeals(); // Reload meals from Firebase
        } else {
          setMessage('Error updating meal: ' + result.error);
        }
      } else {
        // Add new meal
        const mealData = {
          name: formData.name,
          type: formData.mealType.toLowerCase(),
          foods: [
            {
              name: formData.name,
              calories: parseInt(formData.calories) || 0,
              protein: parseInt(formData.protein) || 0,
              carbs: parseInt(formData.carbs) || 0,
              fat: parseInt(formData.fats) || 0
            }
          ],
          totalCalories: parseInt(formData.calories) || 0,
          totalProtein: parseInt(formData.protein) || 0,
          totalCarbs: parseInt(formData.carbs) || 0,
          totalFat: parseInt(formData.fats) || 0,
          notes: `Added meal: ${formData.name}`
        };

        const result = await logMeal(user.uid, mealData);
        if (result.success) {
          setMessage('Meal added successfully!');
          loadTodayMeals(); // Reload meals from Firebase
        } else {
          setMessage('Error adding meal: ' + result.error);
        }
      }

      // Reset form
      setFormData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        mealType: 'Breakfast'
      });
      setShowForm(false);
      setEditingMeal(null);

    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      calories: meal.totalCalories?.toString() || '0',
      protein: meal.totalProtein?.toString() || '0',
      carbs: meal.totalCarbs?.toString() || '0',
      fats: meal.totalFat?.toString() || '0',
      mealType: meal.type ? meal.type.charAt(0).toUpperCase() + meal.type.slice(1) : 'Breakfast'
    });
    setShowForm(true);
  };

  const handleDelete = async (mealId) => {
    try {
      const result = await deleteMeal(mealId);
      if (result.success) {
        setMessage('Meal deleted successfully!');
        loadTodayMeals(); // Reload meals from Firebase
      } else {
        setMessage('Error deleting meal: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMeal(null);
    setFormData({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      mealType: 'Breakfast'
    });
  };

  // Calculate daily totals
  const dailyTotals = meals.reduce((totals, meal) => ({
    calories: totals.calories + (meal.totalCalories || 0),
    protein: totals.protein + (meal.totalProtein || 0),
    carbs: totals.carbs + (meal.totalCarbs || 0),
    fats: totals.fats + (meal.totalFat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const getMealTypeIcon = (type) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="min-h-screen bg-[#10172a] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">
            🥗 Nutrition Tracker
          </h1>
          <p className="text-gray-200">
            Log your meals and track your daily nutrition
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'} mb-6`}>
            {message}
          </div>
        )}

        {/* Daily Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-indigo-600">Today's Nutrition Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{dailyTotals.calories}</div>
              <div className="text-sm opacity-90 text-gray-600">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dailyTotals.protein}g</div>
              <div className="text-sm opacity-90 text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dailyTotals.carbs}g</div>
              <div className="text-sm opacity-90 text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{dailyTotals.fats}g</div>
              <div className="text-sm opacity-90 text-gray-600">Fats</div>
            </div>
          </div>
        </div>

        {/* Add Meal Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Add Meal
          </button>
        </div>

        {/* Meal Form */}
        {showForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {editingMeal ? 'Edit Meal' : 'Add New Meal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Meal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Grilled Chicken Salad"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Meal Type</label>
                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.protein}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">Fats (g)</label>
                  <input
                    type="number"
                    name="fats"
                    value={formData.fats}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingMeal ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    editingMeal ? 'Update Meal' : 'Add Meal'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Meals List */}
        <div className="space-y-4">
          {mealTypes.map(type => {
            const typeMeals = meals.filter(meal => meal.type === type.toLowerCase());
            
            if (typeMeals.length === 0) return null;

            return (
              <div key={type} className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">{getMealTypeIcon(type.toLowerCase())}</span>
                  {type}
                </h3>
                <div className="space-y-3">
                  {typeMeals.map(meal => (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{meal.name}</h4>
                        <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                          <span>🔥 {meal.totalCalories} cal</span>
                          <span>🥩 {meal.totalProtein}g protein</span>
                          <span>🍞 {meal.totalCarbs}g carbs</span>
                          <span>🥑 {meal.totalFat}g fats</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(meal)}
                          className="btn-secondary text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          className="btn-danger text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {meals.length === 0 && !showForm && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🍽️</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No meals logged today
            </h3>
            <p className="text-gray-600 mb-6">
              Start tracking your nutrition by adding your first meal.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add Your First Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrition; 
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Log a meal
export const logMeal = async (userId, mealData) => {
  try {
    const mealRef = await addDoc(collection(db, 'meals'), {
      userId,
      name: mealData.name,
      type: mealData.type, // breakfast, lunch, dinner, snack
      foods: mealData.foods || [],
      totalCalories: mealData.totalCalories || 0,
      totalProtein: mealData.totalProtein || 0,
      totalCarbs: mealData.totalCarbs || 0,
      totalFat: mealData.totalFat || 0,
      notes: mealData.notes || '',
      loggedAt: serverTimestamp(),
      date: mealData.date || new Date().toISOString().split('T')[0]
    });

    return {
      success: true,
      mealId: mealRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's meals for a specific date
export const getUserMeals = async (userId, date) => {
  try {
    console.log('Fetching meals for user:', userId, 'date:', date);
    
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    const meals = [];
    
    querySnapshot.forEach((doc) => {
      const mealData = doc.data();
      meals.push({
        id: doc.id,
        ...mealData
      });
    });

    console.log('Found meals:', meals.length, meals);

    return {
      success: true,
      meals
    };
  } catch (error) {
    console.error('Error fetching meals:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's meals for a date range
export const getUserMealsByDateRange = async (userId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const meals = [];
    
    querySnapshot.forEach((doc) => {
      meals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      meals
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Update a meal
export const updateMeal = async (mealId, mealData) => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await updateDoc(mealRef, {
      ...mealData,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete a meal
export const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get nutrition summary for a date
export const getNutritionSummary = async (userId, date) => {
  try {
    const mealsResult = await getUserMeals(userId, date);
    
    if (!mealsResult.success) {
      return mealsResult;
    }

    const meals = mealsResult.meals;
    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealCount: meals.length
    };

    meals.forEach(meal => {
      summary.totalCalories += meal.totalCalories || 0;
      summary.totalProtein += meal.totalProtein || 0;
      summary.totalCarbs += meal.totalCarbs || 0;
      summary.totalFat += meal.totalFat || 0;
    });

    return {
      success: true,
      summary
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get predefined foods
export const getPredefinedFoods = async () => {
  try {
    const foodsSnapshot = await getDocs(collection(db, 'foods'));
    const foods = [];
    
    foodsSnapshot.forEach((doc) => {
      foods.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      foods
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Search foods by name
export const searchFoods = async (searchTerm) => {
  try {
    const foodsResult = await getPredefinedFoods();
    
    if (!foodsResult.success) {
      return foodsResult;
    }

    const foods = foodsResult.foods.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      success: true,
      foods
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Set nutrition goals for user
export const setNutritionGoals = async (userId, goals) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      nutritionGoals: {
        dailyCalories: goals.dailyCalories || 2000,
        dailyProtein: goals.dailyProtein || 150,
        dailyCarbs: goals.dailyCarbs || 250,
        dailyFat: goals.dailyFat || 65
      },
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get nutrition goals for user
export const getNutritionGoals = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        goals: userData.nutritionGoals || {
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyCarbs: 250,
          dailyFat: 65
        }
      };
    } else {
      return {
        success: false,
        error: 'User not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 
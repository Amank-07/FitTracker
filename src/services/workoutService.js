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

// Add a new workout
export const addWorkout = async (userId, workoutData) => {
  try {
    const workoutRef = await addDoc(collection(db, 'workouts'), {
      userId,
      name: workoutData.name,
      description: workoutData.description,
      exercises: workoutData.exercises || [],
      duration: workoutData.duration || 0,
      difficulty: workoutData.difficulty || 'beginner',
      category: workoutData.category || 'general',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      workoutId: workoutRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's workouts
export const getUserWorkouts = async (userId) => {
  try {
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const workouts = [];
    
    querySnapshot.forEach((doc) => {
      workouts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      workouts
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get a specific workout
export const getWorkout = async (workoutId) => {
  try {
    const workoutDoc = await getDoc(doc(db, 'workouts', workoutId));
    
    if (workoutDoc.exists()) {
      return {
        success: true,
        workout: {
          id: workoutDoc.id,
          ...workoutDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Workout not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Update a workout
export const updateWorkout = async (workoutId, workoutData) => {
  try {
    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, {
      ...workoutData,
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

// Delete a workout
export const deleteWorkout = async (workoutId) => {
  try {
    await deleteDoc(doc(db, 'workouts', workoutId));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Log a completed workout
export const logWorkout = async (userId, workoutData) => {
  try {
    const workoutLogRef = await addDoc(collection(db, 'workoutLogs'), {
      userId,
      workoutId: workoutData.workoutId,
      workoutName: workoutData.workoutName,
      exercises: workoutData.exercises || [],
      duration: workoutData.duration || 0,
      caloriesBurned: workoutData.caloriesBurned || 0,
      notes: workoutData.notes || '',
      completedAt: serverTimestamp()
    });

    return {
      success: true,
      logId: workoutLogRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get workout logs for a user
export const getWorkoutLogs = async (userId, limit = 10) => {
  try {
    const q = query(
      collection(db, 'workoutLogs'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by completedAt in JavaScript instead of Firestore
    logs.sort((a, b) => {
      const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
      const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
      return dateB - dateA; // Descending order
    });

    return {
      success: true,
      logs: logs.slice(0, limit)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete a workout log
export const deleteWorkoutLog = async (logId) => {
  try {
    await deleteDoc(doc(db, 'workoutLogs', logId));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get predefined exercises
export const getPredefinedExercises = async () => {
  try {
    const exercisesSnapshot = await getDocs(collection(db, 'exercises'));
    const exercises = [];
    
    exercisesSnapshot.forEach((doc) => {
      exercises.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      exercises
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 
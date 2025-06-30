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

// Log weight entry
export const logWeight = async (userId, weightData) => {
  try {
    const weightRef = await addDoc(collection(db, 'weightLogs'), {
      userId,
      weight: weightData.weight,
      bodyFat: weightData.bodyFat || null,
      muscleMass: weightData.muscleMass || null,
      notes: weightData.notes || '',
      loggedAt: serverTimestamp(),
      date: weightData.date || new Date().toISOString().split('T')[0]
    });

    return {
      success: true,
      weightId: weightRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get weight history
export const getWeightHistory = async (userId, limit = 30) => {
  try {
    const q = query(
      collection(db, 'weightLogs'),
      where('userId', '==', userId),
      orderBy('loggedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const weightLogs = [];
    
    querySnapshot.forEach((doc) => {
      weightLogs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      weightLogs: weightLogs.slice(0, limit)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Log body measurements
export const logMeasurements = async (userId, measurementData) => {
  try {
    const measurementRef = await addDoc(collection(db, 'measurements'), {
      userId,
      chest: measurementData.chest || null,
      waist: measurementData.waist || null,
      hips: measurementData.hips || null,
      biceps: measurementData.biceps || null,
      thighs: measurementData.thighs || null,
      calves: measurementData.calves || null,
      neck: measurementData.neck || null,
      shoulders: measurementData.shoulders || null,
      notes: measurementData.notes || '',
      loggedAt: serverTimestamp(),
      date: measurementData.date || new Date().toISOString().split('T')[0]
    });

    return {
      success: true,
      measurementId: measurementRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get measurement history
export const getMeasurementHistory = async (userId, limit = 10) => {
  try {
    const q = query(
      collection(db, 'measurements'),
      where('userId', '==', userId),
      orderBy('loggedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const measurements = [];
    
    querySnapshot.forEach((doc) => {
      measurements.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      measurements: measurements.slice(0, limit)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Log progress photo
export const logProgressPhoto = async (userId, photoData) => {
  try {
    const photoRef = await addDoc(collection(db, 'progressPhotos'), {
      userId,
      photoUrl: photoData.photoUrl,
      type: photoData.type || 'front', // front, back, side
      notes: photoData.notes || '',
      loggedAt: serverTimestamp(),
      date: photoData.date || new Date().toISOString().split('T')[0]
    });

    return {
      success: true,
      photoId: photoRef.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get progress photos
export const getProgressPhotos = async (userId, limit = 20) => {
  try {
    const q = query(
      collection(db, 'progressPhotos'),
      where('userId', '==', userId),
      orderBy('loggedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const photos = [];
    
    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      photos: photos.slice(0, limit)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get progress summary
export const getProgressSummary = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get weight logs
    const weightResult = await getWeightHistory(userId, days);
    const weightLogs = weightResult.success ? weightResult.weightLogs : [];
    
    // Get measurement logs
    const measurementResult = await getMeasurementHistory(userId, days);
    const measurements = measurementResult.success ? measurementResult.measurements : [];
    
    // Calculate progress
    const summary = {
      weightChange: 0,
      weightChangePercent: 0,
      measurementChanges: {},
      totalEntries: weightLogs.length + measurements.length,
      period: `${days} days`
    };

    if (weightLogs.length >= 2) {
      const latestWeight = weightLogs[0].weight;
      const oldestWeight = weightLogs[weightLogs.length - 1].weight;
      summary.weightChange = latestWeight - oldestWeight;
      summary.weightChangePercent = ((summary.weightChange / oldestWeight) * 100).toFixed(1);
    }

    if (measurements.length >= 2) {
      const latest = measurements[0];
      const oldest = measurements[measurements.length - 1];
      
      const measurementTypes = ['chest', 'waist', 'hips', 'biceps', 'thighs', 'calves', 'neck', 'shoulders'];
      measurementTypes.forEach(type => {
        if (latest[type] && oldest[type]) {
          summary.measurementChanges[type] = latest[type] - oldest[type];
        }
      });
    }

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

// Set fitness goals
export const setFitnessGoals = async (userId, goals) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fitnessGoals: {
        targetWeight: goals.targetWeight || null,
        targetBodyFat: goals.targetBodyFat || null,
        targetMuscleMass: goals.targetMuscleMass || null,
        targetMeasurements: goals.targetMeasurements || {},
        deadline: goals.deadline || null
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

// Get fitness goals
export const getFitnessGoals = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        goals: userData.fitnessGoals || {}
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

// Delete a progress entry
export const deleteProgressEntry = async (collectionName, entryId) => {
  try {
    await deleteDoc(doc(db, collectionName, entryId));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 
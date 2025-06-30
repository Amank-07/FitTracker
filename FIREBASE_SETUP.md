# Firebase Setup Guide for Health Fitness Tracker

This guide will help you set up Firebase backend for your health fitness tracker application.

## Prerequisites

- A Google account
- Node.js and npm installed
- Firebase CLI (optional but recommended)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "health-fitness-tracker")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### Firestore Database
1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location closest to your users
5. Click "Done"

### Storage
1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" for development
4. Select a location (same as Firestore)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "health-tracker-web")
6. Copy the configuration object

## Step 4: Update Firebase Configuration

1. Open `src/firebase/config.js`
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Set Up Firestore Security Rules

1. Go to Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workouts
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Workout logs
    match /workoutLogs/{logId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Meals
    match /meals/{mealId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Weight logs
    match /weightLogs/{logId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Measurements
    match /measurements/{measurementId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Progress photos
    match /progressPhotos/{photoId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Public data (exercises, foods)
    match /exercises/{exerciseId} {
      allow read: if true;
    }
    
    match /foods/{foodId} {
      allow read: if true;
    }
  }
}
```

## Step 6: Set Up Storage Security Rules

1. Go to Storage → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /progress-photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Step 7: Test Your Setup

1. Start your development server: `npm start`
2. Try to register a new user
3. Check if the user appears in Firebase Authentication
4. Check if user data is created in Firestore

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're not initializing Firebase multiple times
   - Check that you're importing the config correctly

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Make sure the user is authenticated
   - Verify the user ID matches the document owner

3. **"Network request failed"**
   - Check your internet connection
   - Verify your Firebase configuration
   - Make sure your Firebase project is active

## Security Best Practices

1. **Never commit API keys to version control**
   - Use environment variables
   - Add `.env` to your `.gitignore`

2. **Set up proper security rules**
   - Always validate user authentication
   - Restrict access to user's own data
   - Use proper data validation

## Next Steps

1. **Deploy to Production**
   - Build your app: `npm run build`
   - Deploy to Firebase Hosting or your preferred hosting service

2. **Monitor Usage**
   - Use Firebase Analytics to track user behavior
   - Monitor Firestore usage in the console

Your Firebase backend is now ready! The app will use Firebase for:
- User authentication (sign up, sign in, sign out)
- Data storage (workouts, meals, progress tracking)
- File storage (progress photos, profile pictures)
- Real-time data synchronization 
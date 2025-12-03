# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Email/Password
4. Create Firestore Database → Start in test mode
5. Get your config from Project Settings → General → Your apps → Add app → Web

### 2. Update Firebase Config
Replace the placeholder config in `src/firebase/config.js` with your actual Firebase config.

### 3. Start the App
```bash
npm start
```

### 4. Test the App
- Sign up with a new account
- Create a group
- Add some expenses
- Invite friends using the group code

## 🔧 Firestore Security Rules
Copy these rules to your Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/groups/$(resource.data.groupId)).data.members;
    }
  }
}
```

## 🎯 Features Ready to Use
- ✅ User authentication
- ✅ Create/join groups
- ✅ Add expenses
- ✅ Real-time balance calculations
- ✅ Responsive design
- ✅ Group code sharing

## 📱 Test on Mobile
The app is fully responsive and works great on mobile devices!

## 🚀 Deploy
Ready to deploy to Vercel, Netlify, or Firebase Hosting. See README.md for deployment instructions.

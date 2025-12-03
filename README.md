# SquadSplit - Expense Splitter Web App

A modern, full-stack expense splitter web application built with React, Firebase, and Tailwind CSS. Split expenses with friends and family easily with real-time updates and automatic balance calculations.

## 🚀 Features

- **User Authentication**: Secure signup, login, and logout using Firebase Auth
- **Group Management**: Create groups and invite members with unique group codes
- **Expense Tracking**: Add expenses with title, amount, and payer information
- **Automatic Split**: Equal expense splitting with real-time balance calculations
- **Real-time Updates**: Live updates using Firebase Firestore listeners
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Balance Tracking**: See who owes what to whom in each group

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Firebase (Auth + Firestore)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Deployment**: Ready for Vercel, Netlify, or Firebase Hosting

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SquadSplit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password
4. Create a Firestore database
5. Get your Firebase configuration

### 4. Configure Firebase

1. Open `src/firebase/config.js`
2. Replace the placeholder configuration with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 5. Firestore Security Rules

Set up your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Group members can read/write group data
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Group members can read/write expenses
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/groups/$(resource.data.groupId)).data.members;
    }
  }
}
```

### 6. Run the Application

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📱 Usage

### Creating a Group
1. Sign up or log in to your account
2. Click "Create New Group" on the dashboard
3. Enter group name and description
4. Share the generated group code with friends

### Joining a Group
1. Click "Join Group" on the dashboard
2. Enter the 6-character group code
3. You'll be added to the group automatically

### Adding Expenses
1. Navigate to a group
2. Click "Add Expense"
3. Enter expense details (title, amount, payer)
4. The expense will be split equally among all members

### Viewing Balances
- Individual balances are shown for each member
- Positive amounts = money owed to you
- Negative amounts = money you owe

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── Groups/         # Group management components
│   └── Layout/         # Layout components
├── contexts/           # React contexts
├── firebase/           # Firebase configuration
├── services/           # API services
└── App.js             # Main app component
```

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Upload the `build` folder to Netlify

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init hosting
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

## 🔒 Security Features

- Protected routes for authenticated users
- Firestore security rules
- Input validation and sanitization
- Secure authentication with Firebase Auth

## 🎨 Customization

### Styling
The app uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Component styles in `src/index.css`
- Individual component styles

### Features
- Add new expense categories
- Implement different split methods (percentage, custom amounts)
- Add expense history and analytics
- Implement push notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the Firebase console for errors
2. Verify your Firebase configuration
3. Check the browser console for JavaScript errors
4. Ensure Firestore security rules are properly configured

## 🔮 Future Enhancements

- [ ] Expense categories and filtering
- [ ] Multiple split methods (percentage, custom amounts)
- [ ] Expense history and analytics
- [ ] Push notifications
- [ ] Export functionality
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)

---

Built with ❤️ using React and Firebase

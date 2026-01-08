## React Movie Website

A responsive movie browsing application built with React and Vite using the TMDB API.  
This project demonstrates component-based architecture, API data fetching, loading states, and local persistence.

The active application lives in the `/frontend` directory.

---

## 📸 Screenshots

<table align="center">
  <tr>
    <td valign="top">
      <img src="frontend/public/images/home.webp" width="450px" />
    </td>
    <td valign="top">
      <img src="frontend/public/images/all-movies.webp" width="450px" />
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="frontend/public/images/details.webp" width="450px" />
    </td>
    <td valign="top">
      <img src="frontend/public/images/about.webp" width="450px" />
    </td>
  </tr>
    <tr>
    <td valign="top">
      <img src="frontend/public/images/chatroom.webp" width="450px" />
    </td>
  </tr>
</table>

---

## ✨ Features

- Browse trending and popular movies
- Search movies by title
- View detailed movie information
- Save favorites locally
- Responsive layout for desktop and mobile
- Clean, modular React components
- Client-side routing with React Router

---

## 🛠 Tech Stack

- React
- Vite
- JavaScript (ES6+)
- CSS
- Bootstrap
- TMDB API

---

## 📁 Project Structure
```text
react-movie-website/
├── frontend/
│   ├── public/
│   │   └── images/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── styles/
│       └── main.jsx
├── README.md

```  
---

## 🔑 API Setup
This project uses the TMDB API.

Create a free account at https://www.themoviedb.org

Generate an API key

Add it to your environment variables

Instructions:

add .env file to frontend folder
Copy code
VITE_TMDB_API_KEY=your_api_key_here
Replace your_api_key_here with key you got from https://www.themoviedb.org

## 📌 Notes
Favorites are stored locally using browser storage

No backend required

Built as a portfolio-ready React project

---

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev
```

## 🔀 Environment Variables

Create a .env file in /frontend:

VITE_TMDB_API_KEY=your_api_key_here

## 💬 Realtime Chatroom

This project includes a fully functional realtime chatroom built with Firebase Firestore. Messages are sent and received instantly without requiring a custom backend server.

### Features

<ul>
Realtime messaging using Firestore listeners

Persistent messages stored in the cloud

Display name stored locally per user

Automatic message ordering by timestamp

Responsive layout for desktop and mobile

No authentication required for demo use
</ul>

### Tech Used

React

Firebase Firestore

Vite

CSS

### Route
/chat

### How it works

Messages are stored in Firestore under a rooms/general/messages collection

Firestore realtime listeners update the UI instantly when new messages are added

Collections and documents are created automatically on first message send

Firestore security rules allow read and create access for demo purposes


## 💾 Firebase Firestore Setup (Chatroom)
### 1. Log in to Firebase Console

Go to: https://console.firebase.google.com/

Sign in with your Google account.

###  2. Create (or select) your Firebase project

If you already made one, click it in the project list.

If not:

Click Add project

Name it (example: react-movie-website)

Google Analytics: optional (you can leave it off)

Click Create project

### 3. Add a Web App to the project

Inside your project, click the </> Web icon (Add app)

App nickname: react-movie-website (or similar)

Do not enable Firebase Hosting (not required)

Click Register app

You will see a Firebase config object (apiKey, authDomain, etc.)

You will use these values in your .env file (next step)

### 4. Create the Firestore Database

Left sidebar: Build → Firestore Database

Click Create database

Choose Start in test mode for quick local development
(You will switch rules to production-safe rules after)

Pick a Firestore location (choose one close to you, any is fine)

Click Enable

### 5. Enable Authentication (required for secure chat rules)

Left sidebar: Build → Authentication

Click Get started

Go to Sign-in method

Enable Anonymous (fastest for demo)

Optionally also enable Email/Password later

6) Add Firestore Security Rules (recommended)

Left sidebar: Build → Firestore Database

Go to the Rules tab

Paste rules like this (collection name messages):

```env
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Chat messages
    match /rooms/{roomId}/messages/{messageId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    // Claimed usernames
    match /rooms/{roomId}/users/{userId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

  }
}
```

Click Publish

7) Add Firebase config to your local environment

In your React app root (where you run Vite), create or update .env:

```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

Important:

Restart your dev server after changing .env

8) Run the project and test the chatroom

Start the app:

<ul>
<li>npm install</li>

<li>npm run dev</li>

<li>Open the Chatroom page</li>

<li>Pick a display name and send a message</li>

Confirm it appears in Firestore:

Firebase Console → Firestore Database → Data → messages
</ul>


> **Note**
> The realtime chat feature requires a Firebase project with Firestore enabled.
> Reviewers can still run the app without Firebase, but the `/chat` route will not send or receive messages unless Firebase environment variables are configured.
>
> Firebase setup guide: https://firebase.google.com/docs/web/setup
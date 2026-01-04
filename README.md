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

##  Environment Variables

Create a .env file in /frontend:

VITE_TMDB_API_KEY=your_api_key_here

## Realtime Chatroom

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

### Local Setup Notes

This feature requires Firebase environment variables to be present in a .env file:

```env
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

After adding or updating environment variables, restart the dev server.

> **Note**
> The realtime chat feature requires a Firebase project with Firestore enabled.
> Reviewers can still run the app without Firebase, but the `/chat` route will not send or receive messages unless Firebase environment variables are configured.
>
> Firebase setup guide: https://firebase.google.com/docs/web/setup
// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import AllMovies from "./pages/AllMovies";

// ✅ Only one import of MovieProvider, at the top
import { MovieProvider } from "./context/MovieContext";

export default function App() {
  return (
    <MovieProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/movies" element={<AllMovies />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </MovieProvider>
  );
}

// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import AllMovies from "./pages/AllMovies";
import MyTopTen from "./pages/MyTopTen";
import About from "./pages/About";

// ✅ One import, at the top, path must match the file we just created
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
        <Route path="/mytopten" element={<MyTopTen />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </MovieProvider>
  );
}

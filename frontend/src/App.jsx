// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Favorites from "./pages/Favorites";
import AllMovies from "./pages/AllMovies";
import MyTopTen from "./pages/MyTopTen";
import About from "./pages/About";

import { MovieProvider } from "./context/MovieContext";

export default function App() {
  return (
    <MovieProvider>
      <div className="d-flex flex-column min-vh-100">
        <NavBar />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/movies" element={<AllMovies />} />
            <Route path="/mytopten" element={<MyTopTen />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </MovieProvider>
  );
}

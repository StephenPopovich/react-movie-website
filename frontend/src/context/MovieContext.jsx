// frontend/src/context/MovieContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const MovieContext = createContext(null);

export function MovieProvider({ children }) {
  // Load favorites from localStorage once
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {
      // ignore write errors
    }
  }, [favorites]);

  // Check if a movie is in favorites
  const isFavorite = (id) => favorites.some((m) => m?.id === id);

  // Toggle favorite by full movie object (✅ matches your original behavior)
  const toggleFavorite = (movie) => {
    if (!movie || !movie.id) return;
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      return exists ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev];
    });
  };

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite }),
    [favorites]
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export function useMovieContext() {
  const ctx = useContext(MovieContext);
  return ctx || { favorites: [], isFavorite: () => false, toggleFavorite: () => {} };
}

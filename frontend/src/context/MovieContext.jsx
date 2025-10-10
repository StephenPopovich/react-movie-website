// frontend/src/context/MovieContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const MovieContext = createContext(null);

export function MovieProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const isFavorite = (id) => favorites.some((m) => m?.id === id);
  const toggleFavorite = (movie) => {
    if (!movie || !movie.id) return;
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      return exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
    });
  };

  const value = useMemo(() => ({ favorites, isFavorite, toggleFavorite }), [favorites]);

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export function useMovieContext() {
  const ctx = useContext(MovieContext);
  return ctx || { favorites: [], isFavorite: () => false, toggleFavorite: () => {} };
}

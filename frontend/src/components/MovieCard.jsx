import React from "react";
import { useMovieContext } from "../context/MovieContext";

export default function MovieCard({ movie }) {
  // ✅ Safeguard: if context isn’t available, provide harmless fallbacks
  const ctx = typeof useMovieContext === "function" ? useMovieContext() : null;
  const {
    isFavorite = () => false,
    toggleFavorite = () => {},
    favorites = [],
  } = ctx || {};

  // ...keep the rest of your MovieCard JSX exactly the same, using isFavorite(movie.id), toggleFavorite(movie), etc.
}

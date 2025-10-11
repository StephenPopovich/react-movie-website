// frontend/src/components/MovieCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useMovieContext } from "../context/MovieContext";
import "../css/MovieCard.css";

export default function MovieCard({ movie }) {
  const { isFavorite, toggleFavorite } = useMovieContext();

  // Format date nicely
  const formatReleaseDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleFavoriteClick = (e) => {
    // Prevent the parent <Link> from navigating
    e.preventDefault();
    e.stopPropagation();
    // ✅ pass the FULL movie object (your original favorites expect this)
    toggleFavorite(movie);
  };

  const fav = isFavorite(movie.id);

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <img
          src={movie.poster_path || "/no-image.jpg"}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
        />

        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>

          {/* Rating */}
          <p className="movie-rating">
            ⭐ {typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "N/A"}
          </p>

          {/* Full release date under rating */}
          {movie.release_date && (
            <p className="movie-release-date">{formatReleaseDate(movie.release_date)}</p>
          )}
        </div>
      </Link>

      {/* Favorite star */}
      <button
        type="button"
        className={`favorite-btn ${fav ? "active" : ""}`}
        aria-pressed={fav ? "true" : "false"}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        onClick={handleFavoriteClick}
      >
        {fav ? "★" : "☆"}
      </button>
    </div>
  );
}

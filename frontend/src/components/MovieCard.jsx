import React from "react";
import { Link } from "react-router-dom";
import { useMovieContext } from "../context/MovieContext"; // <- exact casing and path
export default function MovieCard({ movie }) {
  if (!movie) {
    return (
      <div style={{ color: "#fff", background: "#111", padding: 12, borderRadius: 8 }}>
        Invalid movie data
      </div>
    );
  }

  // Safe context usage (prevents crashes if provider not mounted)
  let ctx = null;
  try {
    ctx = typeof useMovieContext === "function" ? useMovieContext() : null;
  } catch {
    ctx = null;
  }

  const isFav = ctx && typeof ctx.isFavorite === "function" ? ctx.isFavorite(movie.id) : false;
  const toggleFavorite =
    ctx && typeof ctx.toggleFavorite === "function" ? ctx.toggleFavorite : () => {};

  const title = movie.title || movie.name || "Untitled";
  const poster = movie.poster_path || ""; // api maps to full URL or null

  return (
    <div
      className="movie-card"
      style={{
        background: "#111",
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        to={`/movie/${movie.id}`}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            style={{
              width: "100%",
              display: "block",
              aspectRatio: "2/3",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "2/3",
              background: "#222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              fontSize: 14,
            }}
          >
            No Image
          </div>
        )}
        <div style={{ padding: "0.6rem 0.75rem" }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25, color: "#fff" }}>
            {title}
          </div>
          <div style={{ opacity: 0.8, fontSize: 12, marginTop: 4, color: "#ddd" }}>
            ⭐ {typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "N/A"}
          </div>
        </div>
      </Link>

      <button
        onClick={() => toggleFavorite(movie)}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        style={{
          margin: "0.5rem 0.75rem 0.75rem",
          width: "calc(100% - 1.5rem)",
          border: "none",
          borderRadius: 8,
          padding: "0.5rem 0.7rem",
          cursor: "pointer",
          background: isFav ? "#ff6b6b" : "#1f1f1f",
          color: "#fff",
        }}
      >
        {isFav ? "★ In Favorites" : "☆ Add to Favorites"}
      </button>
    </div>
  );
}

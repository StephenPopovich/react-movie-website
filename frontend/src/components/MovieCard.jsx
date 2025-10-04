import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);

  function onFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation(); // don't navigate when clicking the heart
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  const formattedDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="movie-card">
      {/* wrap the whole visual card in a Link */}
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />
          <div className="movie-overlay">
            <button
              className={`favorite-btn ${favorite ? "active" : ""}`}
              onClick={onFavoriteClick}
            >
              ♥
            </button>
          </div>
        </div>

        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p>{formattedDate}</p>
        </div>
      </Link>
    </div>
  );
}

export default MovieCard;

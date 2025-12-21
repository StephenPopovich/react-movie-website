import "../css/Favorites.css";
import { useMovieContext } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  // default to [] just in case
  const { favorites = [] } = useMovieContext();

  const hasFavorites =
    Array.isArray(favorites) && favorites.length > 0;

  if (!hasFavorites) {
    return (
      <div className="favorites-empty">
        <p className="text-muted">
          You have not added any favorites yet. Browse movies and click the heart icon to save them.
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>Your Favorites</h1>
      <div className="movies-grid">
        {favorites.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </div>
  );
}

export default Favorites;

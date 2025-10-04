// src/pages/MovieDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetailsWithCredits } from "../services/api";
import "../css/MovieDetails.css";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMovieDetailsWithCredits(id);
        setMovie(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p style={{ padding: "1rem" }}>Loading…</p>;
  if (error) return <p style={{ padding: "1rem" }}>{error}</p>;
  if (!movie) return <p style={{ padding: "1rem" }}>No data found.</p>;

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const director =
    movie.credits?.crew?.find((p) => p.job === "Director")?.name || "Unknown";

  const topCast = (movie.credits?.cast || []).slice(0, 8);

  return (
    <div className="movie-details">
      <div className="md-header">
        <Link to="/" className="md-back">← Back</Link>
        <h2 className="md-title">
          {movie.title}{" "}
          {movie.release_date ? `(${movie.release_date.slice(0, 4)})` : ""}
        </h2>
      </div>

      <div className="md-content">
        {poster && <img className="md-poster" src={poster} alt={movie.title} />}

        <div className="md-info">
          <p className="md-overview">{movie.overview || "No overview."}</p>

          <div className="md-meta">
            <div><strong>Director:</strong> {director}</div>
            <div><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} min` : "N/A"}</div>
            <div><strong>Genres:</strong> {(movie.genres || []).map(g => g.name).join(", ") || "N/A"}</div>
            {movie.release_date && (
              <div><strong>Released:</strong> {new Date(movie.release_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</div>
            )}
          </div>

          <div className="md-cast">
            <h3>Top Cast</h3>
            <ul>
              {topCast.map((p) => (
                <li key={p.cast_id || `${p.id}-${p.credit_id}`}>
                  {p.name} <span className="md-character">as {p.character}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;

// /src/pages/MovieDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails } from "../services/api";
import CommentsSection from "../components/comments/CommentsSection.jsx";
// optional: add a details stylesheet if you have one
// import "../css/MovieDetails.css";

function MovieDetails() {
  const { id } = useParams(); // TMDB movie id from route
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getMovieDetails(id);
        if (isMounted) setMovie(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load movie details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const posterUrl = useMemo(() => {
    if (!movie?.poster_path) return null;
    // use whichever TMDB size your app prefers (w342/w500/original)
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }, [movie]);

  const backdropUrl = useMemo(() => {
    if (!movie?.backdrop_path) return null;
    return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  }, [movie]);

  const title = movie?.title || movie?.name || "Untitled";
  const releaseDate = movie?.release_date || movie?.first_air_date || null;

  const formattedReleaseDate = useMemo(() => {
    if (!releaseDate) return "—";
    try {
      return new Date(releaseDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return releaseDate;
    }
  }, [releaseDate]);

  const runtimeText = useMemo(() => {
    const minutes = movie?.runtime;
    if (!minutes && minutes !== 0) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h <= 0) return `${m}m`;
    if (m <= 0) return `${h}h`;
    return `${h}h ${m}m`;
  }, [movie]);

  if (loading) {
    return (
      <div className="movie-details loading">
        <p>Loading movie…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-details error">
        <p>{error}</p>
        <Link to="/" className="back-link">← Back</Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details empty">
        <p>Movie not found.</p>
        <Link to="/" className="back-link">← Back</Link>
      </div>
    );
  }

  return (
    <div className="movie-details">
      {/* Backdrop header (optional) */}
      {backdropUrl && (
        <div
          className="backdrop"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,.85) 10%, rgba(0,0,0,.35) 60%, rgba(0,0,0,.1) 100%), url(${backdropUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            minHeight: "260px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      )}

      <div
        className="details-container"
        style={{
          display: "grid",
          gridTemplateColumns: "160px 1fr",
          gap: "1.25rem",
          padding: "1.25rem",
        }}
      >
        {/* Poster */}
        <div>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${title} poster`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "12px",
                boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "2/3",
                borderRadius: "12px",
                background: "#1d1d1d",
                display: "grid",
                placeItems: "center",
                color: "#aaa",
                fontSize: ".9rem",
              }}
            >
              No image
            </div>
          )}
          <div style={{ marginTop: "0.75rem" }}>
            <Link to="/" className="back-link" style={{ color: "#9bd" }}>
              ← Back
            </Link>
          </div>
        </div>

        {/* Main info */}
        <div>
          <h1 style={{ margin: "0 0 .25rem" }}>{title}</h1>

          <div
            className="meta"
            style={{ opacity: 0.85, display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
            <span><strong>Release:</strong> {formattedReleaseDate}</span>
            {movie?.runtime ? <span><strong>Runtime:</strong> {runtimeText}</span> : null}
            {movie?.vote_average ? (
              <span>
                <strong>Rating:</strong> {Number(movie.vote_average).toFixed(1)}
              </span>
            ) : null}
            {movie?.genres?.length ? (
              <span>
                <strong>Genres:</strong>{" "}
                {movie.genres.map((g) => g.name).join(", ")}
              </span>
            ) : null}
          </div>

          {movie?.tagline ? (
            <p style={{ marginTop: ".75rem", fontStyle: "italic", opacity: 0.9 }}>
              “{movie.tagline}”
            </p>
          ) : null}

          {movie?.overview ? (
            <div style={{ marginTop: ".75rem", lineHeight: 1.6 }}>
              <h3 style={{ marginBottom: ".25rem" }}>Overview</h3>
              <p>{movie.overview}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Comments (localStorage) */}
      <div style={{ padding: "0 1.25rem 1.25rem" }}>
        <CommentsSection movieId={movie.id} title={title} />
      </div>
    </div>
  );
}

export default MovieDetails;

// frontend/src/pages/MovieDetails.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetailsWithCredits } from "../services/api";
import CommentsSection from "../components/comments/CommentsSection.jsx"; // <-- exact path & name
import "../css/MovieDetails.css";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getMovieDetailsWithCredits(id);
        if (!ignore) setMovie(data);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load movie details.");
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  const topCast = useMemo(() => {
    return Array.isArray(movie?.credits?.cast) ? movie.credits.cast.slice(0, 8) : [];
  }, [movie]);

  const formattedReleaseDate = useMemo(() => {
    if (!movie?.release_date) return null;
    const d = new Date(movie.release_date);
    return isNaN(d)
      ? movie.release_date
      : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }, [movie]);

  if (loading) return <div className="mdp-page mdp-status">Loading…</div>;
  if (err) return <div className="mdp-page mdp-status mdp-error">{err}</div>;
  if (!movie) return null;

  return (
    <div className="mdp-page">
      <h1 className="mdp-title">{movie.title}</h1>

      <div className="mdp-header">
        <div className="mdp-poster">
          {movie.poster_path ? (
            <img src={movie.poster_path} alt={movie.title} />
          ) : (
            <div className="mdp-noimage">No Image</div>
          )}
        </div>

        <div className="mdp-meta">
          {movie.overview && <p className="mdp-overview">{movie.overview}</p>}

          <ul className="mdp-facts">
            {formattedReleaseDate && (
              <li>
                <span className="mdp-fact-label">Release:</span>{" "}
                <span className="mdp-fact-value">{formattedReleaseDate}</span>
              </li>
            )}
            {typeof movie.vote_average === "number" && (
              <li>
                <span className="mdp-fact-label">Rating:</span>{" "}
                <span className="mdp-fact-value">{movie.vote_average.toFixed(1)}</span>
              </li>
            )}
            {movie.runtime ? (
              <li>
                <span className="mdp-fact-label">Runtime:</span>{" "}
                <span className="mdp-fact-value">{movie.runtime} min</span>
              </li>
            ) : null}
            {!!movie.genres?.length && (
              <li>
                <span className="mdp-fact-label">Genres:</span>{" "}
                <span className="mdp-fact-value">
                  {movie.genres.map((g) => g.name).join(", ")}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {topCast.length > 0 && (
        <>
          <h2 className="mdp-subtitle">Top Cast</h2>
          <ul className="mdp-cast">
            {topCast.map((p) => (
              <li key={p.cast_id ?? `${p.id}-${p.credit_id}`} className="mdp-cast-item">
                <div className="mdp-cast-name">{p.name}</div>
                <div className="mdp-cast-character">{p.character}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Use your original comments system, unchanged styling */}
      <CommentsSection movieId={id} id={id} movie={movie} />
    </div>
  );
}

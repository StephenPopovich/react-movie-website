// frontend/src/pages/Home.jsx
import "../css/Home.css";
import React, { useEffect, useState } from "react";
import { getPopularMovies } from "../services/api";
import MovieCard from "../components/MovieCard";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getPopularMovies(1);
        if (!ignore) setMovies(Array.isArray(data.results) ? data.results : []);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load popular movies.");
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="home-page">
      <h1 className="mb-2">Popular Movies</h1>
      <p className="text-muted mb-4">
        Browse trending movies and add your favorites for later.
      </p>


      {err && <p>{err}</p>}
      {loading && <p>Loading…</p>}
      <p>
        {/* This line helps confirm data is present */}
        Loaded: {(Array.isArray(movies) ? movies : []).length} items
      </p>

      <div
        className="movie-grid"
      >
        {(Array.isArray(movies) ? movies : []).map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      {!loading && !err && movies.length === 0 && (
        <p>
          No movies returned. (Open Console — you should see “[api] popular 200 …”)
        </p>
      )}
    </div>
  );
}

// frontend/src/pages/Home.jsx
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
    <div className="home-page" style={{ padding: "1.5rem 2rem" }}>
      <h1>Popular Movies</h1>

      {err && <p style={{ color: "#f66", margin: "8px 0" }}>{err}</p>}
      {loading && <p style={{ opacity: 0.8 }}>Loading…</p>}
      <p style={{ opacity: 0.7, fontSize: 12, margin: "6px 0" }}>
        {/* This line helps confirm data is present */}
        Loaded: {(Array.isArray(movies) ? movies : []).length} items
      </p>

      <div
        className="movie-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {(Array.isArray(movies) ? movies : []).map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      {!loading && !err && movies.length === 0 && (
        <p style={{ opacity: 0.8, marginTop: 12 }}>
          No movies returned. (Open Console — you should see “[api] popular 200 …”)
        </p>
      )}
    </div>
  );
}

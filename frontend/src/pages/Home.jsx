// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { getPopularMovies } from "../services/api";
import MovieCard from "../components/MovieCard";

export default function Home() {
  const [movies, setMovies] = useState([]);      // keep as array
  const [page, setPage] = useState(1);           // if you use paging
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await getPopularMovies(page);
        if (!ignore) setMovies(Array.isArray(data.results) ? data.results : []);
      } catch (e) {
        if (!ignore) setErr("Failed to load popular movies.");
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [page]);

  return (
    <div className="home-page">
      <h1>Popular Movies</h1>

      {err && <p style={{ color: "#f66" }}>{err}</p>}
      {loading && <p>Loading…</p>}

      <div className="movie-grid">
        {(Array.isArray(movies) ? movies : []).map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      {/* If you already have pagination controls, keep them */}
      {/* <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <button onClick={() => setPage((p) => p + 1)}>Next</button> */}
    </div>
  );
}

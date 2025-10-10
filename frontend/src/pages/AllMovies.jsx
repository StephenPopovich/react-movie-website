// frontend/src/pages/AllMovies.jsx
import React, { useEffect, useState, useRef } from "react";
import { getMovies, getGenres } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/AllMovies.css";

export default function AllMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);

  // Start with most popular
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("popularity.desc");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);      // ✅ start true to avoid empty flicker
  const [err, setErr] = useState("");
  const hasFetchedOnce = useRef(false);              // ✅ track first fetch completion

  useEffect(() => {
    // Load genres once (no UI dependency, just helpful for the dropdown)
    (async () => {
      try {
        const g = await getGenres();
        setGenres(g);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    // Load on mount and whenever page/sort/genre changes
    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, genre]);

  async function loadMovies() {
    setLoading(true);
    setErr("");
    try {
      const data = await getMovies({
        page,
        query,             // empty string on first load -> discover (most popular)
        sortBy: sort,
        genreId: genre,
      });
      setMovies(Array.isArray(data.results) ? data.results : []);
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      setErr(e.message || "Failed to load movies.");
      console.error(e);
    } finally {
      setLoading(false);
      hasFetchedOnce.current = true; // ✅ now safe to show "empty" message if needed
    }
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadMovies();
  }

  const items = Array.isArray(movies) ? movies : [];
  const searching = !!query;

  return (
    <div className="all-movies-page">
      <h1 className="all-movies-title">
        {searching ? `Results for “${query}”` : "All Movies"}
      </h1>

      <form onSubmit={onSearchSubmit} className="filters">
        <input
          type="text"
          className="filters-input"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* TMDB search ignores sort/genre; disable while searching */}
        <select
          className="filters-select"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          disabled={searching}
          title={searching ? "Disabled while searching" : ""}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="filters-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          disabled={searching}
          title={searching ? "Disabled while searching" : ""}
        >
          <option value="popularity.desc">Popularity ↓</option>
          <option value="popularity.asc">Popularity ↑</option>
          <option value="vote_average.desc">Rating ↓</option>
          <option value="primary_release_date.desc">Newest</option>
          <option value="primary_release_date.asc">Oldest</option>
        </select>

        <button className="filters-button" type="submit">
          {searching ? "Search" : "Refresh"}
        </button>
      </form>

      {err && <p className="error">{err}</p>}
      {loading && <p className="loading">Loading…</p>}

      <div className="movie-grid">
        {items.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      {/* ✅ Only show "empty" after first fetch completes and not loading */}
      {!loading && hasFetchedOnce.current && !err && items.length === 0 && (
        <p className="empty-state">No movies found.</p>
      )}

      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="pagination-label">
          Page {page} of {totalPages}
        </span>
        <button
          className="pagination-btn"
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// frontend/src/pages/AllMovies.jsx
import React, { useEffect, useRef, useState } from "react";
import { getMovies, getGenres } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/AllMovies.css";

export default function AllMovies() {
  // Data
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);

  // Controls
  const [query, setQuery] = useState("");                // empty => show Discover (all movies)
  const [genre, setGenre] = useState("");                // TMDB genre id
  const [sort, setSort] = useState("popularity.desc");   // default to most popular
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status
  const [loading, setLoading] = useState(true);          // start true so we don’t flash “No movies…”
  const [err, setErr] = useState("");
  const hasFetchedOnce = useRef(false);

  // Load genres once
  useEffect(() => {
    (async () => {
      try {
        const g = await getGenres();
        setGenres(g);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Load movies whenever page/sort/genre changes (this drives the “All Movies” experience)
  useEffect(() => {
    if (query.trim()) return; // when searching, fetching happens via submit handler
    fetchMovies({ page, sortBy: sort, genreId: genre, query: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, genre]);

  // Helper to fetch
  async function fetchMovies({ page, sortBy, genreId, query }) {
    setLoading(true);
    setErr("");
    try {
      const data = await getMovies({ page, sortBy, genreId, query });
      setMovies(Array.isArray(data.results) ? data.results : []);
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to load movies.");
    } finally {
      setLoading(false);
      hasFetchedOnce.current = true;
    }
  }

  // Search submit => runs TMDB search; if query is empty, we fall back to Discover
  function onSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    const q = query.trim();
    if (q) {
      fetchMovies({ page: 1, sortBy: sort, genreId: "", query: q }); // TMDB search ignores sort/genre
    } else {
      // empty query -> Discover (all movies)
      fetchMovies({ page: 1, sortBy: sort, genreId: genre, query: "" });
    }
  }

  // If user clears the search box (back to empty), reload Discover page 1 immediately
  useEffect(() => {
    if (query === "" && hasFetchedOnce.current) {
      setPage(1);
      fetchMovies({ page: 1, sortBy: sort, genreId: genre, query: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const items = Array.isArray(movies) ? movies : [];
  const searching = query.trim().length > 0;

  return (
    <div className="all-movies-page">
      <h1 className="all-movies-title">
        {searching ? `Results for “${query}”` : "All Movies"}
      </h1>

      <form onSubmit={onSearchSubmit} className="filters">
        <input
          type="text"
          className="filters-input"
          placeholder="Search movies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Sort/genre apply to Discover; TMDB search ignores them, so disable while searching */}
        <select
          className="filters-select"
          value={genre}
          onChange={(e) => { setPage(1); setGenre(e.target.value); }}
          disabled={searching}
          title={searching ? "Disabled while searching" : ""}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <select
          className="filters-select"
          value={sort}
          onChange={(e) => { setPage(1); setSort(e.target.value); }}
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

      {/* Grid of movies (always shows once loaded) */}
      <div className="movie-grid">
        {items.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      {/* Only show “empty” after a fetch completes AND not loading */}
      {!loading && hasFetchedOnce.current && !err && items.length === 0 && (
        <p className="empty-state">No movies found.</p>
      )}

      {/* Pagination for “All Movies” and also for search results (since TMDB returns pages for both) */}
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

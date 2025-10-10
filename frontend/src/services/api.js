// src/services/api.js

// --- TMDB constants (keep your hardcoded key) ---
const API_KEY = "c4b7be3bacde1f3f3b4b315fadc95aac";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// --- helpers ---
function withParams(path, params = {}) {
  const sp = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
    include_adult: "false",
    ...params,
  });
  return `${BASE_URL}${path}?${sp.toString()}`;
}

function mapMovie(m) {
  return {
    ...m,
    poster_path: m?.poster_path ? IMG_BASE + m.poster_path : null,
    backdrop_path: m?.backdrop_path ? IMG_BASE + m.backdrop_path : null,
  };
}

// ==============================
// Popular / Top Rated / Upcoming
// (existing pages rely on these)
// ==============================
export async function getPopularMovies(page = 1) {
  const url = withParams("/movie/popular", { page });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch popular: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

export async function getTopRatedMovies(page = 1) {
  const url = withParams("/movie/top_rated", { page });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch top rated: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

export async function getUpcomingMovies(page = 1) {
  const url = withParams("/movie/upcoming", { page });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch upcoming: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

// ==============================
// Search (used by MyTopTen, etc.)
// ==============================
export async function searchMovies(query = "", page = 1) {
  const url = withParams("/search/movie", { page, query });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to search: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

// ======================================
// All Movies helpers (discover + genres)
// ======================================
export async function getMovies({
  page = 1,
  query = "",
  sortBy = "popularity.desc",
  genreId = "",
} = {}) {
  const isSearch = query.trim().length > 0;
  const path = isSearch ? "/search/movie" : "/discover/movie";
  const params = isSearch
    ? { page, query }
    : { page, sort_by: sortBy, with_genres: genreId || undefined };

  const url = withParams(path, params);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

export async function getGenres() {
  const url = withParams("/genre/movie/list");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch genres: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.genres) ? data.genres : [];
}

// ======================================
// Details + credits (MovieDetails page)
// ======================================
export async function getMovieDetailsWithCredits(id) {
  if (!id) throw new Error("Movie id is required");
  const [detailsRes, creditsRes] = await Promise.all([
    fetch(withParams(`/movie/${id}`)),
    fetch(withParams(`/movie/${id}/credits`)),
  ]);
  if (!detailsRes.ok) throw new Error(`Failed details: ${detailsRes.status}`);
  if (!creditsRes.ok) throw new Error(`Failed credits: ${creditsRes.status}`);

  const [details, credits] = await Promise.all([
    detailsRes.json(),
    creditsRes.json(),
  ]);
  return {
    ...details,
    poster_path: details?.poster_path ? IMG_BASE + details.poster_path : null,
    backdrop_path: details?.backdrop_path ? IMG_BASE + details.backdrop_path : null,
    credits,
  };
}

// Some files might import this alias:
export { getMovieDetailsWithCredits as getMovieDetails };

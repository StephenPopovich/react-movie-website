// frontend/src/services/api.js

const API_KEY = "c4b7be3bacde1f3f3b4b315fadc95aac";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

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
    title: m?.title ?? m?.name ?? "", // some TMDB responses use "name"
  };
}

async function fetchJson(url, label) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json().catch(() => ({}));
  // Helpful debug (shows status and any TMDB error message)
  console.log(`[api] ${label}`, res.status, data);
  if (!res.ok) {
    const msg = data?.status_message || `HTTP ${res.status}`;
    throw new Error(`${label} failed: ${msg}`);
  }
  return data;
}

// ============== Popular / Top / Upcoming (Home & others) ==============
export async function getPopularMovies(page = 1) {
  const data = await fetchJson(withParams("/movie/popular", { page }), "popular");
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

export async function getTopRatedMovies(page = 1) {
  const data = await fetchJson(withParams("/movie/top_rated", { page }), "top_rated");
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

export async function getUpcomingMovies(page = 1) {
  const data = await fetchJson(withParams("/movie/upcoming", { page }), "upcoming");
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

// =============================== Search (MyTopTen, etc.) ===============================
export async function searchMovies(query = "", page = 1) {
  const data = await fetchJson(withParams("/search/movie", { page, query }), "search");
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

// =========================== All Movies (discover + genres) ===========================
export async function getMovies({ page = 1, query = "", sortBy = "popularity.desc", genreId = "" } = {}) {
  const isSearch = query.trim().length > 0;
  const path = isSearch ? "/search/movie" : "/discover/movie";
  const params = isSearch ? { page, query } : { page, sort_by: sortBy, with_genres: genreId || undefined };
  const data = await fetchJson(withParams(path, params), isSearch ? "search" : "discover");
  return {
    ...data,
    results: Array.isArray(data.results) ? data.results.map(mapMovie) : [],
    total_pages: Math.min(data.total_pages || 1, 500),
  };
}

export async function getGenres() {
  const data = await fetchJson(withParams("/genre/movie/list"), "genres");
  return Array.isArray(data.genres) ? data.genres : [];
}

// ============================== Details + Credits ==============================
export async function getMovieDetailsWithCredits(id) {
  if (!id) throw new Error("Movie id is required");
  const [details, credits] = await Promise.all([
    fetchJson(withParams(`/movie/${id}`), "details"),
    fetchJson(withParams(`/movie/${id}/credits`), "credits"),
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

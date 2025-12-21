// frontend/src/services/api.js

// --- TMDB constants ---
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Optional debug logging (set VITE_DEBUG_API=true in /frontend/.env if you want logs)
const DEBUG_API = String(import.meta.env.VITE_DEBUG_API || "").toLowerCase() === "true";

if (!API_KEY) {
  // Fail fast so you immediately know env is missing
  throw new Error(
    "Missing VITE_TMDB_API_KEY. Create /frontend/.env and add VITE_TMDB_API_KEY=your_key"
  );
}

// ----- helpers -----
function buildParams(obj = {}) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, v);
  });
  return sp;
}

function withParams(path, params = {}) {
  const defaults = {
    api_key: API_KEY,
    language: "en-US",
    include_adult: "false",
  };
  const sp = buildParams({ ...defaults, ...params });
  return `${BASE_URL}${path}?${sp.toString()}`;
}

function mapMovie(m) {
  return {
    ...m,
    poster_path: m?.poster_path ? IMG_BASE + m.poster_path : null,
    backdrop_path: m?.backdrop_path ? IMG_BASE + m.backdrop_path : null,
    title: m?.title ?? m?.name ?? "",
  };
}

async function fetchJson(url, label) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (DEBUG_API) {
    console.log(`[api] ${label}`, res.status, data);
  }

  if (!res.ok) {
    const msg = data?.status_message || `HTTP ${res.status}`;
    throw new Error(`${label} failed: ${msg}`);
  }

  return data;
}

// ==============================
// Popular / Top Rated / Upcoming
// ==============================
export async function getPopularMovies(page = 1) {
  const data1 = await fetchJson(withParams("/movie/popular", { page }), "popular");
  let movies = Array.isArray(data1.results) ? data1.results : [];

  if (movies.length < 24) {
    const data2 = await fetchJson(
      withParams("/movie/popular", { page: page + 1 }),
      "popular-next"
    );
    const more = Array.isArray(data2.results) ? data2.results : [];
    movies = [...movies, ...more].slice(0, 24);
  }

  return {
    ...data1,
    results: movies.map(mapMovie),
    total_pages: Math.min(data1.total_pages || 1, 500),
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

// ==============================
// Search
// ==============================
export async function searchMovies(query = "", page = 1) {
  const data1 = await fetchJson(withParams("/search/movie", { page, query }), "search");
  let movies = Array.isArray(data1.results) ? data1.results : [];

  if (movies.length < 24) {
    const data2 = await fetchJson(
      withParams("/search/movie", { page: page + 1, query }),
      "search-next"
    );
    const more = Array.isArray(data2.results) ? data2.results : [];
    movies = [...movies, ...more].slice(0, 24);
  }

  return {
    ...data1,
    results: movies.map(mapMovie),
    total_pages: Math.min(data1.total_pages || 1, 500),
  };
}

// ======================================
// All Movies (discover + optional genre)
// ======================================
export async function getMovies({
  page = 1,
  query = "",
  sortBy = "popularity.desc",
  genreId = "",
} = {}) {
  const isSearch = query.trim().length > 0;

  if (isSearch) {
    const data1 = await fetchJson(withParams("/search/movie", { page, query }), "search");
    let movies = Array.isArray(data1.results) ? data1.results : [];

    if (movies.length < 24) {
      const data2 = await fetchJson(
        withParams("/search/movie", { page: page + 1, query }),
        "search-next"
      );
      const more = Array.isArray(data2.results) ? data2.results : [];
      movies = [...movies, ...more].slice(0, 24);
    }

    return {
      ...data1,
      results: movies.map(mapMovie),
      total_pages: Math.min(data1.total_pages || 1, 500),
    };
  }

  const params = { page, sort_by: sortBy };
  if (genreId) params.with_genres = genreId;

  const data1 = await fetchJson(withParams("/discover/movie", params), "discover");
  let movies = Array.isArray(data1.results) ? data1.results : [];

  if (movies.length < 24) {
    const data2 = await fetchJson(
      withParams("/discover/movie", { ...params, page: page + 1 }),
      "discover-next"
    );
    const more = Array.isArray(data2.results) ? data2.results : [];
    movies = [...movies, ...more].slice(0, 24);
  }

  return {
    ...data1,
    results: movies.map(mapMovie),
    total_pages: Math.min(data1.total_pages || 1, 500),
  };
}

export async function getGenres() {
  const data = await fetchJson(withParams("/genre/movie/list"), "genres");
  return Array.isArray(data.genres) ? data.genres : [];
}

// ======================================
// Details + credits
// ======================================
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

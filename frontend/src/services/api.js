// src/services/api.js

// ✅ Define API_KEY only once
// If you want to use your .env file, uncomment this line and delete the hardcoded one:
// const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_KEY = "c4b7be3bacde1f3f3b4b315fadc95aac";

const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results;
};

// ✅ Movie details + credits
export async function getMovieDetailsWithCredits(id) {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
  );
  if (!response.ok) throw new Error("Failed to fetch movie details");
  return response.json();
}

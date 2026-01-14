import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { searchMovies } from "../services/api";
import "../css/MyTopTen.css";

const FAVORITES = [
 { title: "Fight Club", year: 1999 },
  { title: "Donnie Darko", year: 2001 },
  { title: "The Lord of the Rings: The Return of the King", year: 2003 },
  { title: "Harry Potter and the Deathly Hallows: Part 2", year: 2011 },
  { title: "Star Wars: Episode III - Revenge of the Sith", year: 2005 },
  { title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001 },
  { title: "Army of Darkness", year: 1992 },
  { title: "SLC Punk!", year: 1998 },
  { title: "Idiocracy", year: 2006 },
  { title: "Harry Potter and the Half-Blood Prince", year: 2009 },
];

export default function MyTopTen() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resolved = [];
        for (const fav of FAVORITES) {
          const results = await searchMovies(fav.title);
          const safeResults = Array.isArray(results) ? results : (results?.results || []);
          const match =
            safeResults.find(m => m.release_date?.startsWith(String(fav.year))) ||
            results?.[0];
          if (match) resolved.push(match);
        }
        setMovies(resolved);
      } catch (e) {
        console.error("Failed to load top ten:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p style={{ padding: "1rem" }}>Loading top ten…</p>;

  return (
    <div className="mytopten-page">
      <h1 className="mytopten-title">My Top Ten Movies</h1>
      <div className="movies-grid">
        {movies.map((movie, idx) => (
          <div key={movie.id ?? `${movie.title}-${idx}`} className="rank-container">
            <span className="rank-badge">{idx + 1}</span>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
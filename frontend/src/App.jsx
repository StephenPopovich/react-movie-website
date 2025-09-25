import './App.css';
import MovieCard from './components/MovieCard'; 

function App() {
  return (
    <>
      <MovieCard movie={{title: "Stephen's Film", release_date: "2024"}} />
      <MovieCard movie={{title: "Alice's Film", release_date: "2026"}} />
    </>
  );
}

export default App

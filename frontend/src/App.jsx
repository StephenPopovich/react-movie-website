// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import MyTopTen from "./pages/MyTopTen";
import MovieDetails from "./pages/MovieDetails";

// ⬇️ import your navbar (pick the one that matches your filename)
import NavBar from "./components/NavBar"; // or: "./components/Navbar"

function App() {
  return (
    <>
      {/* navbar shows on every page */}
      <NavBar />

      {/* page content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/mytopten" element={<MyTopTen />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </>
  );
}

export default App;

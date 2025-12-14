import { Link } from "react-router-dom";
import { useRef, useCallback } from "react";
import "../css/Navbar.css";

export default function NavBar() {
  const rainRef = useRef(null);
  const cooldownRef = useRef(false);

  // spawn popcorn on hover
  const spawnPopcorn = useCallback((count = 14) => {
    const root = rainRef.current;
    if (!root) return;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "popcorn-kernel";
      el.textContent = "🍿";

      const left = Math.random() * 100;
      const scale = 0.85 + Math.random() * 0.6; // 0.85–1.45
      const dur = 900 + Math.random() * 800;    // 0.9–1.7s
      const delay = Math.random() * 120;

      el.style.left = `${left}%`;
      el.style.setProperty("--kernel-scale", String(scale));
      el.style.setProperty("--fall-duration", `${dur}ms`);
      el.style.animationDelay = `${delay}ms`;

      el.addEventListener("animationend", () => el.remove());
      root.appendChild(el);
    }
  }, []);

  const handleHover = () => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    spawnPopcorn();
    setTimeout(() => (cooldownRef.current = false), 350);
  };

  return (
    <nav className="navbar" onMouseEnter={handleHover} onTouchStart={handleHover}>
      <div className="navbar-brand">
        <Link to="/">Movie App</Link>
      </div>

      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/movies" className="nav-link">All Movies</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
        <Link to="/mytopten" className="nav-link">My Top Ten</Link>
      </div>

      {/* kernels get injected here */}
      <div className="popcorn-rain" ref={rainRef} aria-hidden="true" />
    </nav>
  );
}
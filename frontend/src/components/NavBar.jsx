import { Link } from "react-router-dom";
import { useRef, useCallback, useEffect, useState } from "react";
import "../css/Navbar.css";

export default function NavBar() {
  const rainRef = useRef(null);
  const cooldownRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // spawn popcorn on hover
  const spawnPopcorn = useCallback((count = 14) => {
    const root = rainRef.current;
    if (!root) return;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "popcorn-kernel";
      el.textContent = "🍿";

      const left = Math.random() * 100;
      const scale = 0.85 + Math.random() * 0.6;
      const dur = 900 + Math.random() * 800;
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

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav
      className="navbar"
      onMouseEnter={handleHover}
      onTouchStart={handleHover}
    >
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>Movie App</Link>
      </div>

      <button
        className="navbar-toggle"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen ? "true" : "false"}
        onClick={() => setMenuOpen(v => !v)}
      >
        <span className="navbar-bar" />
        <span className="navbar-bar" />
        <span className="navbar-bar" />
      </button>

      <div className={`navbar-links ${menuOpen ? "is-open" : ""}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
        <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
        <Link to="/movies" className="nav-link" onClick={closeMenu}>All Movies</Link>
        <Link to="/favorites" className="nav-link" onClick={closeMenu}>Favorites</Link>
        <Link to="/mytopten" className="nav-link" onClick={closeMenu}>My Top Ten</Link>
      </div>

      {menuOpen && (
        <button
          className="navbar-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

      <div className="popcorn-rain" ref={rainRef} aria-hidden="true" />
    </nav>
  );
}

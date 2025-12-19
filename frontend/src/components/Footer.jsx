
import "../css/Footer.css";

function Footer() {
  return (
    <footer className="footer bg-dark text-light mt-5 py-4">
      <div className="container text-center">
        <p className="mb-1">
          © {new Date().getFullYear()} React Movie App
        </p>
        <p className="mb-0">
          Built with React, Vite, Bootstrap, and TMDB API
        </p>
      </div>
    </footer>
  );
}

export default Footer;

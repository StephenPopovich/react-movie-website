import { useEffect, useRef } from "react";
import "../css/Footer.css";

function Footer() {
  const runnerRef = useRef(null);

  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;

    const startRun = () => {
      runner.classList.remove("footer-runner-active");
      void runner.offsetWidth;
      runner.classList.add("footer-runner-active");
    };

    startRun();
    const interval = setInterval(startRun, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer site-footer text-light py-4">
      <div className="footer-runner" ref={runnerRef} aria-hidden="true">
        <img
          className="footer-runner__img"
          src="./images/jerry.gif"
          alt=""
          draggable="false"
        />
      </div>

      <div className="footer-content">
        <p className="mb-1">© {new Date().getFullYear()} React Movie App</p>
        <p className="mb-0">Built with React, Vite, Bootstrap, and TMDB API</p>
      </div>
    </footer>
  );
}

export default Footer;

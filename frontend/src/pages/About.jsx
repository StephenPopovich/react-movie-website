import "../css/About.css";

const About = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>About This Project</h1>
        <p>
          This movie website is a React-based application built to explore modern
          front-end development patterns, API integration, and clean UI design.
          The goal of the project is to deliver a fast, intuitive way to browse,
          search, and discover movies using real-world data.
        </p>
      </section>

      <section className="about-content">
        <h2>What This App Does</h2>
        <ul>
          <li>Browse popular, trending, and top-rated movies</li>
          <li>Search movies in real time</li>
          <li>View detailed movie information including ratings and summaries</li>
          <li>Responsive layout optimized for desktop and mobile</li>
        </ul>

        <h2>Tech Stack</h2>
        <ul>
          <li>React (Functional Components & Hooks)</li>
          <li>React Router for client-side navigation</li>
          <li>External Movie API for live data</li>
          <li>Modern CSS for layout and styling</li>
        </ul>

        <h2>Why I Built This</h2>
        <p>
          I built this project to strengthen my React skills, practice working
          with third-party APIs, and create a portfolio-ready application that
          reflects real-world front-end development workflows. The focus was on
          performance, clarity, and maintainable code.
        </p>
      </section>
    </main>
  );
};

export default About;

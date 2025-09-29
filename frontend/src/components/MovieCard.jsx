import '../css/MovieCard.css';

function MovieCard({movie}){

    function onFavoriteClick(){
        alert("clicked")
    }
 return <div className="movie-card">
    <div className="movie-poster"> 
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        <div className="movie-overlay">
            <button className="favorite-button" onClick={onFavoriteClick}>
            ♡
            </button>
        </div>
    </div>
    <div className="movie-info"></div>
    <h3>{movie.title}</h3>
    <p>
    {movie.release_date
        ? new Date(movie.release_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : ""}
    </p>
 </div>
}

export default MovieCard
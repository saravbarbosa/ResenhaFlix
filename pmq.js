const movieQuote = require("popular-movie-quotes");

console.log("QUOTE FROM A RANDOM MOVIE");
var film = movieQuote.getSomeRandom(1)[0]

console.log("Quote:", film.quote); 
console.log("Movie:", film.movie); 
console.log("Year:", film.year); 

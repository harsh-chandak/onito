const express = require("express")
const queryRoute = express.Router();
const mySqlQuery = require('../controller/moviesController')

//Populating Tables
// /api/v1/populatingTables
queryRoute.post('/populatingTables',mySqlQuery.createAndPopulateTables);


//Get top 10 movies with highets run time
// /api/v1/longest-duration-movies
queryRoute.get('/longest-duration-movies',mySqlQuery.getHighestRunTimeMovies)


//Add new Movie
// /api/v1/new-movie
queryRoute.post('/new-movie',mySqlQuery.adNewMovie)


//Get top rated Movie
// /api/v1/top-rated-movies
queryRoute.get('/top-rated-movies',mySqlQuery.getTopRatedMovie)


//Get Movies By Genres Sub-Total
// /api/v1/genre-movies-with-subtotals
queryRoute.get('/genre-movies-with-subtotals',mySqlQuery.getMoviesByGenresSubTotal)


//Update Run time
// /api/v1/update-runtime-minutes
queryRoute.post('/update-runtime-minutes',mySqlQuery.updateRunTimeMinutes)



module.exports = queryRoute
'use strict';
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors');
const axios= require("axios");
app.use(cors());
const movieKey = process.env.API_KEY;
const port = process.env.PORT;

// Create Movie constructor
function Movie(id, title, release_date, poster_path, overview){
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

// Routes
app.get("/", handleHome);
app.get("/favorite", handleFavorite);
app.get("/trending", handleTrending);
app.get("/search", handleSearchByName);
app.get("/videos", handleVideos);
app.get("/genre", handleGenre);

//handlers
function handleHome(req, res){
  let movies = data.map((item) => {
    return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
  })
  res.json(movies);
}

function handleFavorite(req, res){
  res.send('Welcome to Favorite Page');
}

async function handleTrending(req, res){
  const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${movieKey}`;
  let movieFromAPI = await axios.get(url);
  let movies = movieFromAPI.data.results.map((item) => {
    return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
  })
    res.send(movies)
  }

function handleSearchByName(req, res){
  let searchByName = req.query.name;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${searchByName}`
  axios.get(url).then((result)=>{
   console.log(result.data);
   res.send(result.data.results)
  })
  .catch((error) =>{
   res.status(500).send(error, "error");
  })
 }

const MOVIE_ID = 123;
async function handleVideos(req, res) {
  const movieId = req.query.id;
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${movieKey}`;
  let movieFromAPI = await axios.get(url);
  const videos = movieFromAPI.data.results;
  res.send(videos);
}

async function handleGenre(req, res) {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${movieKey}`
  let movieFromAPI = await axios.get(url);
  const genres = movieFromAPI.data.genres;
  res.send(genres);
}

//function to handle 404 Errors
app.use((req, res, next) => {
    res.status(404).send("page not found error");
});

//function to handle 500 Errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      status: 500,
      responseText: 'Sorry, something went wrong'
    });
});

app.listen(port, () => {
    console.log(`server is listing on port ${port}`);
});
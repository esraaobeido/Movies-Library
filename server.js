'use strict';
require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
// const data = require('./Movie Data/data.json');
const express = require("express");
const app = express();
const cors = require('cors');
app.use(express.json());
const axios= require("axios");
app.use(cors());
const movieKey = process.env.API_KEY;
const port = process.env.PORT;

// Create Movie constructor
function Movie(id, title, release_date, poster_path, overview, comments){
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
    this.comments = comments
}

// Routes
app.get("/", handleHome);
app.get("/favorite", handleFavorite);
app.get("/trending", handleTrending);
app.get("/search", handleSearchByName);
app.get("/videos", handleVideos);
app.get("/genre", handleGenre);
app.get("/getMovies", handleGetMovies);
app.post("/getMovies", handleAddMovie);
app.delete("/delete/:id", deleteMoviesHandler); 
app.put("/update/:id", updateMoviesHandler);
app.get("/getMovie/:id", getMovieHandler);

//handlers

function updateMoviesHandler(req, res) {
  const movieId = req.params.id;
  const values = [req.body.comments];
  const sql = `UPDATE movies SET comments=$1 WHERE id=${movieId} RETURNING *;`;
  client.query(sql, values).then((data) => {
    res.status(200).send(data.rows);
  });
}

function deleteMoviesHandler(req, res) {
  const movieId = req.params.id;
  if(!movieId) {
    res.status(400).send('Movie id is missing');
    return;
  }
  const sql = `DELETE FROM movies WHERE id=${movieId} RETURNING *;`;
  client.query(sql).then((data) => {
    res.status(202).send('deleted');
  });
} 

function getMovieHandler(req, res) {
  const movieId = req.params.id;
  const sql = `SELECT * FROM movies WHERE id=${movieId};`;
  client.query(sql)
  .then((data) => {
    const movie = data.rows.map((item) => new Movie(
      item.id,
      item.title,
      item.release_date,
      item.poster_path,
      item.overview,
      item.comments
    ));
    res.status(200).send(movie);
  });
}

function handleGetMovies(req, res){
  const sql = 'SELECT * FROM movies';
  client.query(sql)
  .then((data) => {
      let dataFromDB = data.rows.map((item) => {
          let singleMovie = new Movie(
              item.id,
              item.title,
              item.release_date,
              item.poster_path,
              item.overview,
              item.comments
          )
          return singleMovie;
      });
      res.send(dataFromDB);
  })
}

function handleAddMovie(req, res){
  console.log("handleAddMovie route called");
  const movie = req.body;
  const { id, title, release_date, poster_path, overview, comments } = movie;
  const values = [id, title, release_date, poster_path, overview, comments];
  const sql = `INSERT into movies (id, title, release_date, poster_path, overview, comments) values ($1,$2,$3,$4,$5,$6) RETURNING *;`;  
  client.query(sql, values).then((data) => {
    res.status(201).send(data.rows);
    res.send('added successfully');
  });
}


function handleHome(req, res){
  res.send("Welcome to Database Home");
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

client.connect().then(() => {
app.listen(port, () => {
   console.log(`server is listing on port ${port}`);
});
});

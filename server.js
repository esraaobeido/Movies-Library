'use strict';
const express = require("express");
const data = require('./Movie Data/data.json');
const app = express();
const port = 3001;
let result = [];
const cors = require('cors');
app.use(cors());

//Create Home Page Endpoint
app.get('/', (req, res) => {
    function Movie(title, poster_path, overview){
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
        result.push(this); 
    }
        let newMovie = new Movie(data.title, data.poster_path, data.overview);
        res.json(result);
  });

//Create Favorite Page Endpoint
app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
  });

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
})
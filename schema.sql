DROP TABLE IF EXISTS movies;
CREATE TABLE IF NOT EXISTS movies(
id SERIAL PRIMARY KEY ,
title varchar(255),
release_date DATE,
poster_path VARCHAR(255),
overview TEXT,
comments TEXT,
);




const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
require("dotenv").config();
// Function to scrape movie data
async function scrapeMovies(city) {
  try {
    const url = process.env.URL;
    const response = await axios.get(`${url}/${city}`);
    const $ = cheerio.load(response.data);

    const selectedElement = $(
      "#__next > div.hidden-xs > div > div.MovieCityLanding_widgetsWrap__BZOJq > div > div.H5RunningMovies_runningMovies__OwvfH.H5RunningMovies_seoPadding___idgh > div.H5RunningMovies_moviesList__s8J6Z > ul"
    );
    const children = selectedElement.children();
    const movies = [];

    children.each((index, movieRow) => {
      try {
        const movieObj = JSON.parse(movieRow.children[0].children[0].data);
        if (movieObj["@type"] === "Movie") {
          movies.push({
            name: movieObj.name,
            language: movieObj.inLanguage,
            rating: movieObj.aggregateRating
              ? movieObj.aggregateRating.ratingValue
              : 0.0,
            datePublished: movieObj.datePublished,
          });
        }
      } catch (parseError) {
        console.error("Error parsing movie data:", parseError);
      }
    });

    return movies;
  } catch (error) {
    console.error("Error loading the page:", error);
    throw new Error("Internal Server Error");
  }
}

// Function to generate HTML response
function generateHTML(city, movies) {
  const host = process.env.HOST;
  return `<html>
    <head>
      <title>Movie Shows</title>
    </head>
    <body>
      <ul>
      <li><a href=host+"/rajkot">Rajkot</a></li>
      <li><a href=host+"/ahemdabad">Ahemdabad</a></li>
      <li><a href=host+"/vadodara">Vadodara</a></li>
      <li><a href=host+"/surat">Surat</a></li>
      <li><a href=host+"/mumbai">Mumbai</a></li>
      <li><a href=host+"/anand">Anand</a></li>
      </ul>
      <h1>Movie List ${city}</h1>
      <ul>
        ${movies
          .map(
            (movie) =>
              `<li>${movie.name}</li><li>${movie.language}</li><li>${movie.rating}</li><li>${movie.datePublished}</li><hr>`
          )
          .join("")}
      </ul>
    </body>
  </html>`;
}

app.get("/", (req, res) => {
  return res.send("enter /cityname to get movie list.");
});

app.get("/:city", async (req, res) => {
  const city = req.params.city;

  try {
    const movies = await scrapeMovies(city);
    const htmlResponse = generateHTML(city, movies);
    return res.send(htmlResponse);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = app;
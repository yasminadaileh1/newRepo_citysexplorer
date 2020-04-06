require('dotenv').config();
const express = require('express');
// create our app 
// expose the prototype that will get set on requests
// expose the prototype that will get set on responses

const cors = require('cors');
// cors origin source sharing

const superagent = require('superagent');

const PORT = process.env.PORT || 4000;
// we write it in the .env file also an alternative for it in case the server shutdown.

const app = express();
// app.handle (req, res, next);

app.use(cors());
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.use(errorHandler);

function locationHandler(request, response) {
 const city = request.query.city;
  superagent(
    `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
    // console.log(GEOCODE_API_KEY)
  )
  .then((res) => {
      const geoData = res.body;
      const locationData = new Location(city, geoData);
    //   console.log(locationData)
      response.status(200).json(locationData);
    })
    .catch((error) => errorHandler(error, request, response));
}

function weatherHandler(request, response) { 
  
     superagent(
       `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
       
     )
     .then((res) => {
        console.log(res);
        const weatherNow = res.body.data.map((weatherData) => {
          return new Weather(weatherData);
        //   console.log(weatherNow);
        });
        response.status(200).json(weatherNow);
      })
      .catch((error) => errorHandler(error, request, response));
  }


function Location ( city , geoData){
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}
function Weather (weatherData){
    this.forecast = weatherData.weather.description ;
    this.datetime = new Date(weatherData.valid_date).toDateString()
}

function errorHandler(error, request, response) {
    response.status(500).send(error);
  }
app.use('*', (request, response) => response.status(404).send('404 page not found'));



// app.use('*', (request, response) => response.status(404).send('404 page not found'));
app.listen(PORT,() => console.log( ` this is our express ${express}`));
app.listen(PORT,() => console.log( ` this is our app ${app}`));
app.listen(PORT,() => console.log(`Listening to port ${PORT}`));



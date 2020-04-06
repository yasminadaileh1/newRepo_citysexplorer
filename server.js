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
app.get('/trails',trailHandler);
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
     .then((weatherApi) => {
        console.log(weatherApi);
        const weatherNow = weatherApi.body.data.map((weatherData) => {
          return new Weather(weatherData);
        //   console.log(weatherNow);
        });
        response.status(200).json(weatherNow);
      })
      .catch((error) => errorHandler(error, request, response));
  }
  function trailHandler (request , response){
    const latitude = request.query.latitude;
    const longitude = request.query.longitude;
    superagent(
      `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxResult=10${process.env.TRAIL_API_KEY}`
    )
    .then((res) => {
      const newTrail = res.body.trails.map((res)=>{
        return new Trail(res);
      });
      response.status(200).json(newTrail);
    }
    )
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
// {
//   "name": "Rattlesnake Ledge",
//   "location": "Riverbend, Washington",
//   "length": "4.3",
//   "stars": "4.4",
//   "star_votes": "84",
//   "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
//   "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
//   "conditions": "Dry: The trail is clearly marked and well maintained.",
//   "condition_date": "2018-07-21",
//   "condition_time": "0:00:00 "
// },
function Trail ( trialData){
  this.name = trialData.name;
  this.location = trialData.location;
  this.lengh = trialData.lengh;
  this.stars = trialData.stars;
  this.star_votes = trialData.star_votes;
  this.summary = trialData.summary;
  this.trail_url = trialData.trail_url;
  this.conditions =trialData.conditions;
  this.condition_date = trialData.condition_date;
  this.condition_time = trialData.condition_time;
}


function errorHandler(error, request, response) {
    response.status(500).send(error);
  }
app.use('*', (request, response) => response.status(404).send('404 page not found'));



// app.use('*', (request, response) => response.status(404).send('404 page not found'));
app.listen(PORT,() => console.log( ` this is our express ${express}`));
app.listen(PORT,() => console.log( ` this is our app ${app}`));
app.listen(PORT,() => console.log(`Listening to port ${PORT}`));



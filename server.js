// steps to start the server ..
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');

// constructors ..
function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}

function Weather(weatherData) {
    this.forecast = weatherData.weather.description;
    this.datetime = new Date(weatherData.valid_date).toString().slice(4, 15);
}

function Trail(trail) {
    this.name = trail.name;
    this.location = trail.location;
    this.length = trail.length;
    this.stars = trail.stars;
    this.star_votes = trail.starVotes;
    this.summary = trail.summary;
    this.trail_url = trail.url;
    this.condition_time = trail.conditionDate.slice(11); 
    this.condition_date = trail.conditionDate.slice(0, 10);
}
// now we will git the data from the API :
// we need to differentiate between two type of the request .. we have a request from the client to the server
// and request from the server to the 3rd part that will provied us with the data ..
app.get('/location', (request, response) => {
    const city = request.query.city;
    // console.log(`hello our ${city}`);
    // this console will give us undefine until we identify our city with the request..

    // to be sure if it works:
    // console.log('hello') it give us in the terminal hello ! which mean thing is good until NOW :)
    // we need to get the data from other sources and for this we need the API and super agent 
    superagent(`https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`)
        // now after that we need the THEN order ( we catch the data , then ?)
        .then((res) => {
            const geoData = res.body;
            // console.log(`geoData is our ${geoData}`)
            // before specifing which city we want we have an array whit 6 object so I think its the data for the six cities that we have.
            // after selecting the city we will see array of 10 object and I think its the properties that we have for each city.

            const locationData = new Location(city, geoData);
            // console.log(`this is our new object ${locationData}`);

            response.status(200).json(locationData);
        })
        .catch((error) => errorHandler(error, request, response));
});

app.get('/weather', (request, response) => {
    const city = request.query.search_query;
    // console.log(` this is our ${city}`) so to reach to the city we need to define the search query for it.
    superagent(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}`)
        .then((res) => {
            const weatherNow = res.body.data.map((weatherData) => {
                return new Weather(weatherData)
                // I notes that if we write in the local host weather without entering any city the map with broken because we are using the method without having any data!
            });
            response.status(200).json(weatherNow)
        })
        .catch((error) => errorHandler(error, request, response));
});

app.get('/trails', (request, response) => {
    // const latitudeSearch = request.query.latitude
    // const longitudeSearch = request.query.longitude
    superagent(`https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxResult=10&key=${process.env.TRAIL_API_KEY}`)
        // console.log(`hello ${latitude} and ${longitude}`)
        .then((res) => {
            const trialData = res.body.trails.map((ourTrail) => {
                return new Trail(ourTrail);
            });
            response.status(200).json(trialData)
        })
        .catch((error) => errorHandler(error, request, response));
});

function errorHandler(error, request, response) {
    response.status(500).send(error);
}
app.use('*', (request, response) => response.status(404).send('404 page not found'));



// app.use('*', (request, response) => response.status(404).send('404 page not found'));
app.listen(PORT,() => console.log( ` this is our express ${express}`));
app.listen(PORT,() => console.log( ` this is our app ${app}`));
app.listen(PORT,() => console.log(`Listening to port ${PORT}`));



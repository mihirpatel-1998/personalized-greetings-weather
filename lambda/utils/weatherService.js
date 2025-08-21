const axios = require('axios');

async function fetchSunriseSunset(lat, lon, date) {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;
  const { data } = await axios.get(url);
  return {
    date,
    sunrise: data.results.sunrise,
    sunset: data.results.sunset
  };
}

async function getNextDaysWeather(lat, lon, days = 5) {
  const today = new Date();
  const promises = [];
  for (let i = 0; i < days; i++) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() + i);
    const dateStr = dateObj.toISOString().split('T')[0];
    promises.push(fetchSunriseSunset(lat, lon, dateStr));
  }
  const weatherData = await Promise.all(promises);
  return weatherData;
}

async function getWeatherForDates(lat, lon, dateStrings = []) {
  const out = [];
  for (const ds of dateStrings) {
    const sun = await fetchSunriseSunset(lat, lon, ds);
    out.push(sun);
  }
  return out;
}

module.exports = { fetchSunriseSunset, getNextDaysWeather, getWeatherForDates };

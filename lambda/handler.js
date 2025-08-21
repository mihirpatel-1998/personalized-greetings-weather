const { updateWeatherData } = require("./weatherUpdater");

module.exports.weatherUpdater = async (event) => {
  try {
    await updateWeatherData(event);
    console.log("Weather updater finished");
    return { statusCode: 200, body: "Weather data updated successfully" };
  } catch (err) {
    console.error("Lambda error:", err);
    return { statusCode: 500, body: "Error updating weather data" };
  }
};

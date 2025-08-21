require('dotenv').config({ path: '.env' });
const { updateWeatherData } = require('./weatherUpdater');

(async () => {
  try {
    await updateWeatherData();
    process.exit(0);
  } catch (err) {
    console.error('❌ Local run failed:', err);
    process.exit(1);
  }
})();

const connectDB = require('./config/db');
const Location = require('./models/location.model');
const { getWeatherForDates } = require('./utils/weatherService');

/** Helper: return array of YYYY-MM-DD (UTC) for today..today+days-1 */
function targetDateStrings(days = 5) {
  const today = new Date();
  const baseUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const arr = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(baseUTC);
    d.setUTCDate(baseUTC.getUTCDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

async function updateOneLocationRolling(loc) {
  const desiredDates = targetDateStrings(5); // e.g., [2025-08-21 .. 2025-08-25]
  const desiredSet = new Set(desiredDates);

  // Ensure array exists
  const current = Array.isArray(loc.weatherData) ? loc.weatherData : [];

  // Keep only entries that belong to the desired window (by date string)
  const keptByDate = new Map();
  for (const entry of current) {
    if (entry?.date && desiredSet.has(entry.date)) {
      // prefer first occurrence per date
      if (!keptByDate.has(entry.date)) keptByDate.set(entry.date, entry);
    }
  }

  // Determine which dates are missing
  const missingDates = desiredDates.filter(d => !keptByDate.has(d));

  // Fetch only missing dates
  if (missingDates.length) {
    try {
      const fetched = await getWeatherForDates(loc.latitude, loc.longitude, missingDates);
      for (const f of fetched) keptByDate.set(f.date, f);
    } catch (e) {
      console.error(`Failed fetching missing dates for ${loc.name} (${loc._id}):`, e.message || e);
    }
  }

  // Build final array ordered by date ascending (exactly 5)
  const finalArr = desiredDates.map(d => keptByDate.get(d)).filter(Boolean);

  loc.weatherData = finalArr;
  await loc.save();
  console.log(`Rolled weatherData for ${loc.name} -> ${loc.weatherData.length} entries`);
}

/**
 * Main entry:
 * - Cron mode (no event.locationId): update all active locations (rolling window).
 * - Single mode (event.locationId): update just that location (used after create).
 */
async function updateWeatherData(event = {}) {
  await connectDB();

  if (event && event.locationId) {
    const loc = await Location.findById(event.locationId);
    if (!loc) {
      console.warn(`Location ${event.locationId} not found, skipping`);
      return;
    }
    await updateOneLocationRolling(loc);
    return;
  }

  // Cron mode: all active
  const locations = await Location.find({ isActive: true });
  for (const loc of locations) {
    try {
      await updateOneLocationRolling(loc);
    } catch (err) {
      console.error(`Failed rolling update for ${loc.name} (${loc._id}):`, err.message || err);
    }
  }
}

module.exports = { updateWeatherData };

if (require.main === module) {
  (async () => {
    try {
      require('dotenv').config();                     
      await updateWeatherData();                      
      console.log('Local run completed');
      await mongoose.connection.close(true);          
      process.exit(0);
    } catch (err) {
      console.error('Local run failed:', err);
      try { await mongoose.connection.close(true); } catch {}
      process.exit(1);
    }
  })();
}
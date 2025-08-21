const createError = require('http-errors');
const Location = require('../../src/models/location.model');
const tzlookup = require('tz-lookup');
const { DateTime } = require('luxon');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({ region: process.env.AWS_REGION });

// POST /api/v1/locations
async function createLocation(req, res, next) {
  try {
    const { name, latitude, longitude, isActive } = req.body;

    const timezone = tzlookup(latitude, longitude);

    const location = await Location.create({ name, latitude, longitude, timezone, isActive });

    await lambda.invoke({
      FunctionName: process.env.WEATHER_LAMBDA_NAME, 
      InvocationType: 'Event',
      Payload: JSON.stringify({ locationId: location._id })
    }).promise();

    return res.status(201).json({message: 'Location created successfully'});
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/locations
// Supports optional query params: q (search by name), isActive, limit, page
async function listLocations(req, res, next) {
  try {
    const {
      q,
      isActive,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (q) filter.name = { $regex: String(q), $options: 'i' };
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Location.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Location.countDocuments(filter)
    ]);

    return res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/locations/:id
async function getLocationById(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Location.findById(id);
    if (!doc) throw createError(404, 'Location not found');
    return res.json(doc);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/locations/:id
async function updateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, timezone, isActive } = req.body;

    const doc = await Location.findById(id);
    if (!doc) throw createError(404, 'Location not found');

    if (typeof name !== 'undefined') doc.name = name;
    if (typeof latitude === 'number') doc.latitude = latitude;
    if (typeof longitude === 'number') doc.longitude = longitude;
    if (typeof timezone !== 'undefined') doc.timezone = timezone;
    if (typeof isActive === 'boolean') doc.isActive = isActive;

    await doc.save();
    return res.json(doc);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/locations/:id
async function deleteLocation(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Location.findByIdAndDelete(id);
    if (!doc) throw createError(404, 'Location not found');
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getGreeting (req, res, next) {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) return res.status(404).json({ message: 'Location not found' });

    const tz = location.timezone || 'UTC';
    const now = DateTime.now().setZone(tz);

    let greeting = 'Hello';
    const hour = now.hour;

    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17 && hour < 21) greeting = 'Good evening';
    else greeting = 'Good night';

    res.json({ greeting, time: now.toISO(), timezone: tz });
  } catch (err) {
    next(err);
  }
};

async function getSunriseSunset(req, res, next) {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const data = (location.weatherData || []).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      location: location.name,
      timezone: location.timezone,
      weatherData: data
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLocation,
  listLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getGreeting,
  getSunriseSunset
};

const mongoose = require('mongoose');

const weatherEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    sunrise: {
      type: String,
      required: true
    },
    sunset: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 120,
      required: [true, 'Location name is required']
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be >= -90'],
      max: [90, 'Latitude must be <= 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be >= -180'],
      max: [180, 'Longitude must be <= 180']
    },
    timezone: {
      type: String,
      trim: true
    },
    weatherData: {
      type: [weatherEntrySchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: 'weatherData cannot exceed 5 entries'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Cleaner JSON
LocationSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const Location = mongoose.model('Location', LocationSchema);
module.exports = Location;

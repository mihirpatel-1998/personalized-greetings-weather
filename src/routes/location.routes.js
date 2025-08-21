const express = require('express');
const {
  createLocation,
  listLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getGreeting,
  getSunriseSunset
} = require('../controllers/location.controller');

const { validate } = require('../middlewares/validate');
const {
  createLocationSchema,
  updateLocationSchema,
  getOrDeleteByIdSchema
} = require('../validations/location.schema');

const router = express.Router();

router.post('/', validate(createLocationSchema), createLocation);
router.get('/', listLocations);
router.get('/:id', validate(getOrDeleteByIdSchema), getLocationById);
router.patch('/:id', validate(updateLocationSchema), updateLocation);
router.delete('/:id', validate(getOrDeleteByIdSchema), deleteLocation);
router.get('/:id/greeting', getGreeting);
router.get('/:id/sunrise-sunset', getSunriseSunset);

module.exports = router;

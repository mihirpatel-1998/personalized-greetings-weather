const express = require('express');

const locationRoutes = require('./location.routes');

const router = express.Router();

router.use('/locations', locationRoutes);

module.exports = router;

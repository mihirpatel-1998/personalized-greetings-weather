function notFoundHandler(_req, res, _next) {
  return res.status(404).json({
    error: { message: 'Not Found' }
  });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;

  if (err?.details) {
    return res.status(status).json({
      error: {
        message: err.message || 'Validation error',
        details: err.details
      }
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      error: {
        message: 'Duplicate location (latitude, longitude must be unique).',
        keyValue: err.keyValue
      }
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({
      error: { message: `Invalid ${err.path}: ${err.value}` }
    });
  }

  return res.status(status).json({
    error: { message: err.message || 'Internal Server Error' }
  });
}

module.exports = { notFoundHandler, errorHandler };

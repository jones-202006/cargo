function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      details: Object.values(err.errors || {}).map(e => e.message)
    });
  }

  return res.status(status).json({
    message
  });
}

module.exports = errorHandler;


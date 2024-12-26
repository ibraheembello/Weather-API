export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error(`Error ${err.name}: ${err.message}`);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode
    });
  }

  // Handle Redis connection errors
  if (err.name === 'RedisError') {
    return res.status(503).json({
      error: 'Cache service unavailable',
      status: 503
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    status: statusCode
  });
};

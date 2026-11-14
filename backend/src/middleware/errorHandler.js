// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
  // If response status not set, treat as server error
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 400;
  }

  console.error(err);

  // Respond with status code, error message, and stack trace if not in production
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;

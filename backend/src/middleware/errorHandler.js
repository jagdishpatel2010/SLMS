/**
 * Central error handling middleware.
 *
 * Converts thrown errors (ApiError, Sequelize validation/unique/FK errors)
 * into consistent JSON responses. Detailed information is logged server-side
 * only; clients receive a safe, generic message for unexpected failures.
 */
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * 404 handler for unmatched routes.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Error-handling middleware. Must keep the 4-arg signature for Express to
 * recognise it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Sequelize: schema/model validation failed — surface the field messages.
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  // Sequelize: unique constraint violation (e.g. email already registered).
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const field = err.errors?.[0]?.path || 'field';
    message = `A record with that ${field} already exists.`;
  }

  // Sequelize: invalid foreign key or type mismatch.
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Related record not found or still referenced.';
  }
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Invalid request data.';
  }

  // For unexpected 500s, log details server-side and return a generic message
  // in production so internal details are never leaked to the client.
  if (statusCode >= 500) {
    console.error('Unhandled error:', err);
    if (config.isProduction) {
      message = 'Something went wrong. Please try again later.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace only in development to aid debugging.
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
};

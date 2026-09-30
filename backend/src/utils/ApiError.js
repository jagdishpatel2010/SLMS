/**
 * ApiError.
 *
 * A small Error subclass that carries an HTTP status code so controllers can
 * throw semantically meaningful errors and the central error handler can map
 * them to the correct response status.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status to return.
   * @param {string} message - Client-safe error message.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    // Marks errors we raised intentionally vs unexpected crashes.
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

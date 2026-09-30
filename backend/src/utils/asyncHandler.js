/**
 * asyncHandler.
 *
 * Wraps an async Express handler so rejected promises are forwarded to
 * `next()` instead of crashing the process. This removes the need for a
 * try/catch in every controller.
 *
 * @param {Function} fn - An async (req, res, next) handler.
 * @returns {Function} A handler that catches and forwards errors.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

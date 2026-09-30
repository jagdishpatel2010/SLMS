/**
 * Validation result middleware.
 *
 * Runs after express-validator rule chains. If any rule failed, it aggregates
 * the messages into a single 400 response instead of proceeding to the
 * controller.
 */
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Collect validation errors and short-circuit with a 400 when present.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((e) => e.msg)
    .join(', ');
  throw new ApiError(400, message);
};

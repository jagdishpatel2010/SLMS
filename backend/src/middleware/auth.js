/**
 * Authentication and authorization middleware.
 *
 * `protect` verifies the JWT (from cookie or Authorization header) and loads
 * the user onto req.user. `authorize` restricts a route to specific roles.
 */
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Require a valid, authenticated user.
 *
 * Reads the token from the httpOnly cookie first, then falls back to a Bearer
 * Authorization header (useful for API clients/tests). Rejects with 401 when
 * no valid token/user is found.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  // Fall back to the Authorization header for non-browser clients.
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch {
    // Do not leak whether the token was expired vs malformed.
    throw new ApiError(401, 'Session is invalid or has expired.');
  }

  // Confirm the user still exists (e.g. not deleted after token issuance).
  const user = await User.findByPk(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The account for this session no longer exists.');
  }

  req.user = user;
  next();
});

/**
 * Restrict a route to one or more roles.
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin').
 * @returns {Function} Middleware that returns 403 for disallowed roles.
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };

/**
 * Rate limiters.
 *
 * `apiLimiter` applies a general ceiling to all API traffic; `authLimiter`
 * applies a much stricter limit to authentication endpoints to slow down
 * credential brute-force attacks.
 */
import rateLimit from 'express-rate-limit';

// General API limiter: generous, protects against accidental floods.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Strict limiter for login/register: few attempts per window.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

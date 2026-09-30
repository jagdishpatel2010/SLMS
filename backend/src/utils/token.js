/**
 * JWT helpers.
 *
 * Signs access tokens and sets them as httpOnly cookies. Keeping token logic
 * in one module means the signing options (secret, expiry, cookie flags) are
 * defined once and reused by every auth flow.
 */
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Sign a JWT for the given user id and role.
 *
 * @param {object} payload - Claims to embed (e.g. { id, role }).
 * @returns {string} A signed JWT.
 */
export const signToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

/**
 * Attach the token to the response as a secure, httpOnly cookie.
 *
 * httpOnly blocks JavaScript access (mitigates XSS token theft), sameSite
 * mitigates CSRF, and `secure` is enabled in production so the cookie only
 * travels over HTTPS.
 *
 * @param {import('express').Response} res - Express response.
 * @param {string} token - Signed JWT.
 */
export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
  });
};

/**
 * Clear the auth cookie (used on logout).
 *
 * @param {import('express').Response} res - Express response.
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
  });
};

/**
 * Authentication controller.
 *
 * Handles registration, login, logout, and returning the current user.
 * Tokens are issued as httpOnly cookies; the token is also returned in the
 * body so header-based clients (and the SPA's in-memory state) can use it.
 */
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, setTokenCookie, clearTokenCookie } from '../utils/token.js';

/**
 * Shape a user row into a safe public object (never includes password).
 *
 * @param {import('../models/User.js').User} user - User instance.
 * @returns {{id: number, name: string, email: string, role: string}}
 */
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * POST /api/auth/register
 * Create a new account and start an authenticated session.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ where: { email: String(email).toLowerCase() } });
  if (exists) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Only allow the privileged 'admin' role when explicitly requested; default
  // everyone else to 'student'.
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'student',
  });

  const token = signToken({ id: user.id, role: user.role });
  setTokenCookie(res, token);

  res.status(201).json({ success: true, token, user: publicUser(user) });
});

/**
 * POST /api/auth/login
 * Verify credentials and start an authenticated session.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Use the `withPassword` scope since the default scope hides the hash.
  const user = await User.scope('withPassword').findOne({
    where: { email: String(email).toLowerCase() },
  });

  // One generic message for both "no user" and "bad password" so we do not
  // reveal which emails are registered.
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({ id: user.id, role: user.role });
  setTokenCookie(res, token);

  res.json({ success: true, token, user: publicUser(user) });
});

/**
 * POST /api/auth/logout
 * Clear the auth cookie.
 */
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user (used to rehydrate the SPA).
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

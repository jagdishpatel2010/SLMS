/**
 * Auth API calls.
 *
 * Thin wrappers around the axios instance so components never build URLs or
 * handle raw responses directly.
 */
import api from '../utils/api.js';

export const registerRequest = (payload) =>
  api.post('/auth/register', payload).then((r) => r.data);

export const loginRequest = (payload) =>
  api.post('/auth/login', payload).then((r) => r.data);

export const logoutRequest = () => api.post('/auth/logout').then((r) => r.data);

export const getMeRequest = () => api.get('/auth/me').then((r) => r.data);

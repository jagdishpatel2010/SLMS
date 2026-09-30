/**
 * Axios instance shared across the app.
 *
 * `withCredentials` ensures the httpOnly auth cookie is sent with every
 * request. A response interceptor normalises error messages so components can
 * display a single, safe string.
 */
import axios from 'axios';

// VITE_API_URL defaults to the proxied "/api" path in development.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive the httpOnly JWT cookie
});

// Normalise errors: surface the server's message when present, otherwise a
// generic fallback. This keeps sensitive internals out of the UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;

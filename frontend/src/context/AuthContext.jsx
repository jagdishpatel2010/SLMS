/**
 * Authentication context.
 *
 * Holds the current user and exposes login/register/logout actions. On mount
 * it calls /auth/me to rehydrate the session from the httpOnly cookie so a
 * page refresh keeps the user logged in.
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
} from '../services/authService.js';

const AuthContext = createContext(null);

/**
 * Provider that wraps the app and supplies auth state + actions.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // `loading` is true only during the initial session check so the router can
  // avoid redirecting before we know whether the user is authenticated.
  const [loading, setLoading] = useState(true);

  // Rehydrate the session once on mount.
  useEffect(() => {
    let active = true;
    getMeRequest()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        // No valid session — remain logged out. This is expected, not an error.
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerRequest(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    // Clear server cookie first, then local state.
    await logoutRequest().catch(() => {});
    setUser(null);
  }, []);

  // Memoise the value so consumers do not re-render on unrelated changes.
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to consume the auth context.
 *
 * @returns {object} Auth state and actions.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

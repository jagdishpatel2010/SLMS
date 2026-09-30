/**
 * ProtectedRoute — guards routes that require authentication (and optionally a
 * specific role). Redirects unauthenticated users to /login and users lacking
 * the required role to the dashboard.
 */
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../Spinner/index.js';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait for the initial session check before deciding to redirect.
  if (loading) return <Spinner label="Checking your session…" />;

  // Not logged in -> send to login, remembering where they wanted to go.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not an admin on an admin-only route.
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};

export default ProtectedRoute;

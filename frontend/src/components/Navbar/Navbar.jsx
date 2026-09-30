/**
 * Navbar — top navigation. Shows different links for guests, students, and
 * admins, plus a logout action for authenticated users.
 */
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  // Log the user out and return them to the login screen.
  const handleLogout = async () => {
    await logout();
    notify('You have been logged out.', 'success');
    navigate('/login');
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link to="/" className="navbar-brand">
        SLMS
      </Link>

      <div className="navbar-links">
        <NavLink to="/courses" className="navbar-link">
          Courses
        </NavLink>

        {isAuthenticated && (
          <NavLink to="/dashboard" className="navbar-link">
            Dashboard
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/admin" className="navbar-link">
            Admin
          </NavLink>
        )}

        {isAuthenticated ? (
          <>
            <span className="navbar-user">Hi, {user?.name?.split(' ')[0] || 'there'}</span>
            <button type="button" className="navbar-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar-link">
              Login
            </NavLink>
            <NavLink to="/register" className="navbar-btn">
              Sign up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

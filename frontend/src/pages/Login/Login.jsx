/**
 * Login page.
 *
 * Validates email/password client-side, then calls the auth context's login.
 * On success it redirects to the page the user originally requested (or the
 * dashboard).
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';

// Field validators return an error string, or '' when the value is valid.
const validators = {
  email: (v) => (!v ? 'Email is required.' : !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email.' : ''),
  password: (v) => (!v ? 'Password is required.' : ''),
};

const Login = () => {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { email: '', password: '' },
    validators
  );

  // Where to send the user after a successful login.
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      await login(values);
      notify('Welcome back!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // The API interceptor already produced a safe message.
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="card">
        <h1 className="page-title">Log in</h1>
        <p className="page-subtitle">Access your courses and track your progress.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              aria-invalid={Boolean(touched.email && errors.email)}
            />
            {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              aria-invalid={Boolean(touched.password && errors.password)}
            />
            {touched.password && errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-muted" style={{ marginTop: '1rem' }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="text-muted">
          No account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;

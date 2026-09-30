/**
 * Register page.
 *
 * Collects name/email/password with client-side validation, then registers via
 * the auth context. On success the user is logged in and sent to the dashboard.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';

const validators = {
  name: (v) => (!v ? 'Name is required.' : v.trim().length < 2 ? 'Name is too short.' : ''),
  email: (v) => (!v ? 'Email is required.' : !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email.' : ''),
  password: (v) =>
    !v ? 'Password is required.' : v.length < 6 ? 'Password must be at least 6 characters.' : '',
  confirm: (v, values) =>
    !v ? 'Please confirm your password.' : v !== values.password ? 'Passwords do not match.' : '',
};

const Register = () => {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { name: '', email: '', password: '', confirm: '' },
    validators
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      // Only send the fields the API expects; never send the confirm field.
      await register({ name: values.name, email: values.email, password: values.password });
      notify('Account created. Welcome!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="card">
        <h1 className="page-title">Create account</h1>
        <p className="page-subtitle">Join and start learning in minutes.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
              aria-invalid={Boolean(touched.name && errors.name)}
            />
            {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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
              autoComplete="new-password"
              aria-invalid={Boolean(touched.password && errors.password)}
            />
            {touched.password && errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="form-control"
              value={values.confirm}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              aria-invalid={Boolean(touched.confirm && errors.confirm)}
            />
            {touched.confirm && errors.confirm && (
              <span className="field-error">{errors.confirm}</span>
            )}
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-muted" style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

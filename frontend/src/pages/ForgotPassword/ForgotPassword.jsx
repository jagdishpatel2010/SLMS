/**
 * ForgotPassword — UI-only password reset request screen.
 *
 * The task specifies a "Forgot Password UI". This collects the email and shows
 * a confirmation. Wiring it to a real reset-email backend is a future step; the
 * component is intentionally self-contained and does not leak whether an email
 * exists (it always shows the same confirmation).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm.js';

const validators = {
  email: (v) => (!v ? 'Email is required.' : !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email.' : ''),
};

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { email: '' },
    validators
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    // Always show the same message regardless of whether the email is
    // registered, so we never disclose which accounts exist.
    setSubmitted(true);
  };

  return (
    <section className="auth-wrap">
      <div className="card">
        <h1 className="page-title">Reset password</h1>

        {submitted ? (
          <>
            <p className="page-subtitle">
              If an account exists for that email, a reset link has been sent. Please check your
              inbox.
            </p>
            <Link to="/login" className="btn btn-secondary">
              Back to login
            </Link>
          </>
        ) : (
          <>
            <p className="page-subtitle">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
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
                {touched.email && errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }}>
                Send reset link
              </button>
            </form>
            <p className="text-muted" style={{ marginTop: '1rem' }}>
              Remembered it? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default ForgotPassword;

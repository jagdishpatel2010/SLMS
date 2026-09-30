/**
 * Spinner — a simple accessible loading indicator.
 */
import PropTypes from 'prop-types';
import './Spinner.css';

const Spinner = ({ label = 'Loading…' }) => (
  // role="status" announces the loading state to screen readers.
  <div className="spinner-wrap" role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true" />
    <span className="spinner-label">{label}</span>
  </div>
);

Spinner.propTypes = {
  label: PropTypes.string,
};

export default Spinner;

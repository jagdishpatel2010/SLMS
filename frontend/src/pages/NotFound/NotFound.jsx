/**
 * NotFound — fallback page for unmatched routes.
 */
import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="empty-state">
    <h1 className="page-title">404</h1>
    <p className="page-subtitle">We couldn&apos;t find the page you were looking for.</p>
    <Link to="/" className="btn">
      Go home
    </Link>
  </section>
);

export default NotFound;

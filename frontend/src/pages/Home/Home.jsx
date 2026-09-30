/**
 * Home — landing page introducing the platform with a call to action.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="home">
      <div className="home-hero card">
        <h1 className="page-title">Learn something new today</h1>
        <p className="page-subtitle">
          Browse courses, follow structured lessons, take quizzes, and track your progress — all
          in one place.
        </p>
        <div className="row">
          <Link to="/courses" className="btn">
            Browse courses
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-secondary">
              Create an account
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" className="btn btn-secondary">
              Go to dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cards home-features">
        <div className="card">
          <h3>Structured lessons</h3>
          <p className="text-muted">Move through modules and lessons at your own pace.</p>
        </div>
        <div className="card">
          <h3>Quizzes &amp; scores</h3>
          <p className="text-muted">Test your knowledge and see instant, graded results.</p>
        </div>
        <div className="card">
          <h3>Progress tracking</h3>
          <p className="text-muted">Watch your completion percentage climb as you learn.</p>
        </div>
      </div>
    </section>
  );
};

export default Home;

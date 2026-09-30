/**
 * Dashboard — the student's learning overview.
 *
 * Shows enrolled/completed/in-progress counts, overall progress, per-course
 * progress bars, and recent quiz scores. Data comes from GET /api/progress.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProgress, fetchMyEnrollments } from '../../services/courseService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { notify } = useToast();
  const [progress, setProgress] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // Load progress summary and enrollment list together.
    Promise.all([fetchProgress(), fetchMyEnrollments()])
      .then(([progressData, enrollmentData]) => {
        if (!active) return;
        setProgress(progressData.progress);
        setEnrollments(enrollmentData.enrollments);
      })
      .catch((err) => notify(err.message, 'error'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  if (loading) return <Spinner label="Loading your dashboard…" />;

  return (
    <section className="dashboard">
      <h1 className="page-title">Hi {user?.name?.split(' ')[0]}, welcome back</h1>
      <p className="page-subtitle">Here&apos;s your learning at a glance.</p>

      {/* Summary stats */}
      <div className="grid dashboard-stats">
        <div className="card stat">
          <span className="stat-value">{progress?.enrolledCount ?? 0}</span>
          <span className="stat-label">Enrolled</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{progress?.inProgressCount ?? 0}</span>
          <span className="stat-label">In progress</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{progress?.completedCount ?? 0}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{progress?.overallProgress ?? 0}%</span>
          <span className="stat-label">Overall progress</span>
        </div>
      </div>

      {/* Enrolled courses with progress bars */}
      <div className="card">
        <h2>My courses</h2>
        {enrollments.length === 0 ? (
          <div className="empty-state">
            You haven&apos;t enrolled in any courses yet.{' '}
            <Link to="/courses">Browse the catalogue</Link>.
          </div>
        ) : (
          <ul className="enrollment-list">
            {enrollments.map((e) => (
              <li key={e._id} className="enrollment-item">
                <div className="enrollment-info">
                  <strong>{e.course?.name || 'Course'}</strong>
                  <span className="text-muted">
                    {e.status === 'completed' ? 'Completed' : 'In progress'} — {e.progress}%
                  </span>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${e.progress}%` }} />
                </div>
                {e.course && (
                  <Link to={`/learn/${e.course._id}`} className="btn btn-sm">
                    Resume
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quiz scores */}
      <div className="card">
        <h2>Quiz scores</h2>
        {progress?.quizScores?.length === 0 ? (
          <p className="text-muted">No quiz attempts yet.</p>
        ) : (
          <table className="scores-table">
            <thead>
              <tr>
                <th scope="col">Quiz</th>
                <th scope="col">Course</th>
                <th scope="col">Score</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {progress?.quizScores?.map((s, idx) => (
                <tr key={`${s.quizTitle}-${idx}`}>
                  <td>{s.quizTitle}</td>
                  <td>{s.courseName}</td>
                  <td>{s.percentage}%</td>
                  <td>
                    <span className={`badge ${s.passed ? 'badge-pass' : 'badge-fail'}`}>
                      {s.passed ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

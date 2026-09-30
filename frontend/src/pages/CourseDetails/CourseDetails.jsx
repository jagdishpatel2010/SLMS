/**
 * CourseDetails — full course view with description, instructor, modules,
 * lessons, quizzes, and an Enroll action. Enrolled students get a link into
 * the learning interface instead of the enroll button.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchCourse,
  enrollInCourse,
  fetchEnrollmentForCourse,
} from '../../services/courseService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';
import './CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Load the course; if logged in, also check enrollment status.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourse(id);
      setCourse(data.course);

      if (isAuthenticated) {
        try {
          await fetchEnrollmentForCourse(id);
          setEnrolled(true);
        } catch {
          // A 404 simply means "not enrolled" — not an error to surface.
          setEnrolled(false);
        }
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEnroll = async () => {
    // Guests must log in before enrolling.
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      setEnrolled(true);
      notify('Enrolled successfully!', 'success');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Spinner label="Loading course…" />;
  if (!course) return <div className="empty-state">Course not found.</div>;

  // Group lessons by module for display.
  const modules = course.lessons?.reduce((acc, lesson) => {
    const key = lesson.module || 'General';
    (acc[key] = acc[key] || []).push(lesson);
    return acc;
  }, {});

  return (
    <section className="course-details">
      <div className="card course-details-header">
        <div>
          <div className="row">
            <span className="badge">{course.category}</span>
            <span className="badge">{course.level}</span>
            {course.duration && <span className="text-muted">{course.duration}</span>}
          </div>
          <h1 className="page-title">{course.name}</h1>
          <p className="text-muted">Instructor: {course.instructor}</p>
          <p>{course.description}</p>

          {enrolled ? (
            <Link to={`/learn/${course._id}`} className="btn">
              Continue learning
            </Link>
          ) : (
            <button type="button" className="btn" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Enrolling…' : 'Enroll now'}
            </button>
          )}
        </div>
      </div>

      <div className="grid course-details-body">
        {/* Modules & lessons */}
        <div className="card">
          <h2>Course content</h2>
          {course.lessons?.length === 0 ? (
            <p className="text-muted">Lessons for this course are coming soon.</p>
          ) : (
            Object.entries(modules).map(([moduleName, lessons]) => (
              <div key={moduleName} className="module-block">
                <h3 className="module-title">{moduleName}</h3>
                <ul className="lesson-list">
                  {lessons.map((lesson) => (
                    <li key={lesson._id} className="lesson-item">
                      <span>{lesson.title}</span>
                      {lesson.duration && (
                        <span className="text-muted lesson-duration">{lesson.duration}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Quizzes */}
        <div className="card">
          <h2>Quizzes</h2>
          {course.quizzes?.length === 0 ? (
            <p className="text-muted">No quizzes yet.</p>
          ) : (
            <ul className="lesson-list">
              {course.quizzes.map((quiz) => (
                <li key={quiz._id} className="lesson-item">
                  <span>{quiz.title}</span>
                  <span className="text-muted">{quiz.questionCount} questions</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default CourseDetails;

/**
 * Learning — the lesson viewer for an enrolled course.
 *
 * Displays the current lesson's title, content, and optional video link.
 * Provides next/previous navigation, a "mark complete" action that updates
 * enrollment progress, and a sidebar list of all lessons with completion
 * status.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchCourse,
  fetchLessons,
  fetchEnrollmentForCourse,
  markLessonComplete,
} from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';
import './Learning.css';

const Learning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load course meta, lesson list, and the user's enrollment (for progress).
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [courseData, lessonData, enrollment] = await Promise.all([
        fetchCourse(courseId),
        fetchLessons(courseId),
        fetchEnrollmentForCourse(courseId),
      ]);
      setCourse(courseData.course);
      setLessons(lessonData.lessons);
      setCompletedIds(enrollment.enrollment.completedLessons.map(String));
      setProgress(enrollment.enrollment.progress);
    } catch (err) {
      // Most likely not enrolled — send them back to the course page.
      notify(err.message, 'error');
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  }, [courseId, notify, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const currentLesson = lessons[currentIndex];

  // Whether the currently viewed lesson is already completed.
  const isCurrentComplete = useMemo(
    () => currentLesson && completedIds.includes(String(currentLesson._id)),
    [currentLesson, completedIds]
  );

  const handleComplete = async () => {
    if (!currentLesson) return;
    setSaving(true);
    try {
      const data = await markLessonComplete(courseId, currentLesson._id);
      setCompletedIds(data.enrollment.completedLessons.map(String));
      setProgress(data.enrollment.progress);
      notify('Lesson marked complete.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(lessons.length - 1, i + 1));

  if (loading) return <Spinner label="Loading lessons…" />;
  if (lessons.length === 0) {
    return (
      <div className="empty-state">
        This course has no lessons yet. <Link to={`/courses/${courseId}`}>Back to course</Link>
      </div>
    );
  }

  return (
    <section className="learning">
      {/* Sidebar: lesson list + progress */}
      <aside className="learning-sidebar card" aria-label="Lesson list">
        <h2 className="learning-course-name">{course?.name}</h2>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-muted">{progress}% complete</p>

        <ol className="learning-lessons">
          {lessons.map((lesson, idx) => {
            const done = completedIds.includes(String(lesson._id));
            return (
              <li key={lesson._id}>
                <button
                  type="button"
                  className={`learning-lesson-btn ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <span className={`lesson-status ${done ? 'done' : ''}`} aria-hidden="true">
                    {done ? '✓' : idx + 1}
                  </span>
                  <span>{lesson.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Main: current lesson */}
      <article className="learning-content card">
        <p className="text-muted">{currentLesson.module}</p>
        <h1 className="page-title">{currentLesson.title}</h1>

        {currentLesson.videoUrl && (
          <p>
            <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer">
              ▶ Watch the video for this lesson
            </a>
          </p>
        )}

        <div className="learning-body">{currentLesson.content || 'No content provided.'}</div>

        <div className="learning-actions row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <button
            type="button"
            className="btn"
            onClick={handleComplete}
            disabled={saving || isCurrentComplete}
          >
            {isCurrentComplete ? 'Completed' : saving ? 'Saving…' : 'Mark as complete'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={goNext}
            disabled={currentIndex === lessons.length - 1}
          >
            Next →
          </button>
        </div>

        {/* Quizzes for this course */}
        {course?.quizzes?.length > 0 && (
          <div className="learning-quizzes">
            <h3>Quizzes</h3>
            <div className="row">
              {course.quizzes.map((quiz) => (
                <Link key={quiz._id} to={`/quiz/${quiz._id}`} className="btn btn-sm">
                  {quiz.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default Learning;

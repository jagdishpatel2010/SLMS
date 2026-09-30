/**
 * ManageQuizzes — admin quiz builder for a selected course.
 *
 * Lists existing quizzes and provides a form to create a new quiz with a
 * dynamic set of questions. Each question has editable options and a radio to
 * mark the correct one. Answers are only ever sent to the server, never shown
 * to students.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchCourses,
  fetchQuizzes,
  createQuiz,
  deleteQuiz,
} from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';

// A blank question with two empty options and the first marked correct.
const blankQuestion = () => ({ text: '', options: ['', ''], correctOption: 0 });

const ManageQuizzes = () => {
  const { notify } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New-quiz form state.
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([blankQuestion()]);

  useEffect(() => {
    fetchCourses()
      .then((data) => setCourses(data.courses))
      .catch((err) => notify(err.message, 'error'));
  }, [notify]);

  const loadQuizzes = useCallback(
    async (courseId) => {
      if (!courseId) {
        setQuizzes([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchQuizzes(courseId);
        setQuizzes(data.quizzes);
      } catch (err) {
        notify(err.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    loadQuizzes(selectedCourse);
  }, [selectedCourse, loadQuizzes]);

  const resetForm = () => {
    setTitle('');
    setQuestions([blankQuestion()]);
  };

  /* ----------------------- Question editing helpers ---------------------- */

  const updateQuestionText = (qIndex, value) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, text: value } : q)));
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === optIndex ? value : o)) } : q
      )
    );
  };

  const setCorrect = (qIndex, optIndex) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, correctOption: optIndex } : q)));
  };

  const addOption = (qIndex) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ''] } : q)));
  };

  const removeOption = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        // Keep at least two options; adjust correctOption if needed.
        if (q.options.length <= 2) return q;
        const options = q.options.filter((_, j) => j !== optIndex);
        let correctOption = q.correctOption;
        if (optIndex === correctOption) correctOption = 0;
        else if (optIndex < correctOption) correctOption -= 1;
        return { ...q, options, correctOption };
      })
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, blankQuestion()]);
  const removeQuestion = (qIndex) =>
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== qIndex) : prev));

  /* ------------------------------- Submit -------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      notify('Select a course first.', 'error');
      return;
    }
    if (!title.trim()) {
      notify('Quiz title is required.', 'error');
      return;
    }
    // Client-side validation mirrors the server rules for quick feedback.
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q.text.trim()) {
        notify(`Question ${i + 1} needs text.`, 'error');
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        notify(`Question ${i + 1} has an empty option.`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      await createQuiz({ course: selectedCourse, title, questions });
      notify('Quiz created.', 'success');
      resetForm();
      loadQuizzes(selectedCourse);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      notify('Quiz deleted.', 'success');
      loadQuizzes(selectedCourse);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Course selector */}
      <div className="form-group" style={{ maxWidth: 360 }}>
        <label htmlFor="quiz-course-select">Select a course</label>
        <select
          id="quiz-course-select"
          className="form-control"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">— Choose a course —</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="admin-section">
          {/* Existing quizzes */}
          <div className="card">
            <h2>Quizzes</h2>
            {loading ? (
              <Spinner label="Loading…" />
            ) : quizzes.length === 0 ? (
              <p className="text-muted">No quizzes for this course yet.</p>
            ) : (
              <ul className="admin-list">
                {quizzes.map((q) => (
                  <li key={q._id} className="admin-list-item">
                    <div className="admin-list-item-main">
                      <strong>{q.title}</strong>
                      <span className="text-muted">{q.questions.length} questions</span>
                    </div>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(q._id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* New quiz builder */}
          <div className="card">
            <h2>Create quiz</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="quiz-title">Quiz title</label>
                <input
                  id="quiz-title"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {questions.map((q, qIndex) => (
                <div key={qIndex} className="admin-question-editor">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong>Question {qIndex + 1}</strong>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`q-${qIndex}`}>Question text</label>
                    <input
                      id={`q-${qIndex}`}
                      className="form-control"
                      value={q.text}
                      onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    />
                  </div>

                  <p className="text-muted" style={{ margin: '0 0 0.4rem' }}>
                    Options (select the correct one):
                  </p>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="admin-option-row">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctOption === optIndex}
                        onChange={() => setCorrect(qIndex, optIndex)}
                        aria-label={`Mark option ${optIndex + 1} correct`}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => removeOption(qIndex, optIndex)}
                          aria-label={`Remove option ${optIndex + 1}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => addOption(qIndex)}>
                    + Add option
                  </button>
                </div>
              ))}

              <div className="admin-form-actions">
                <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                  + Add question
                </button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Create quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuizzes;

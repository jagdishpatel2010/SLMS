/**
 * Quiz — take a quiz and view graded results.
 *
 * Loads a quiz (without answers), lets the student pick one option per
 * question, submits the answers for server-side grading, and then displays the
 * result: total questions, correct, wrong, percentage, and pass/fail.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchQuiz, submitQuiz } from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';
import './Quiz.css';

const Quiz = () => {
  const { quizId } = useParams();
  const { notify } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> selected option index
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchQuiz(quizId);
      setQuiz(data.quiz);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [quizId, notify]);

  useEffect(() => {
    load();
  }, [load]);

  // Record the selected option for a question.
  const selectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Require every question to be answered before submitting.
    if (Object.keys(answers).length < quiz.questions.length) {
      notify('Please answer every question before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitQuiz(quizId, answers);
      setResult(data.result);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading quiz…" />;
  if (!quiz) return <div className="empty-state">Quiz not found.</div>;

  // Results view -----------------------------------------------------------
  if (result) {
    return (
      <section className="quiz">
        <div className="card quiz-result">
          <h1 className="page-title">{quiz.title} — Results</h1>
          <div className={`quiz-result-badge ${result.passed ? 'pass' : 'fail'}`}>
            {result.passed ? 'Passed' : 'Failed'}
          </div>

          <ul className="quiz-result-stats">
            <li>
              <span>Total questions</span>
              <strong>{result.totalQuestions}</strong>
            </li>
            <li>
              <span>Correct answers</span>
              <strong>{result.correctAnswers}</strong>
            </li>
            <li>
              <span>Wrong answers</span>
              <strong>{result.wrongAnswers}</strong>
            </li>
            <li>
              <span>Percentage</span>
              <strong>{result.percentage}%</strong>
            </li>
            <li>
              <span>Pass mark</span>
              <strong>{result.passThreshold}%</strong>
            </li>
          </ul>

          <div className="row">
            <Link to="/dashboard" className="btn">
              Back to dashboard
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                // Allow retaking: reset answers and result.
                setAnswers({});
                setResult(null);
              }}
            >
              Retake quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Quiz-taking view --------------------------------------------------------
  return (
    <section className="quiz">
      <h1 className="page-title">{quiz.title}</h1>
      <p className="page-subtitle">Answer all {quiz.questions.length} questions.</p>

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((q, qIndex) => (
          <fieldset key={q._id} className="card quiz-question">
            <legend className="quiz-question-text">
              {qIndex + 1}. {q.text}
            </legend>
            <div className="quiz-options">
              {q.options.map((option, optIndex) => (
                <label key={optIndex} className="quiz-option">
                  <input
                    type="radio"
                    name={q._id}
                    value={optIndex}
                    checked={answers[q._id] === optIndex}
                    onChange={() => selectOption(q._id, optIndex)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit quiz'}
        </button>
      </form>
    </section>
  );
};

export default Quiz;

/**
 * ManageLessons — admin CRUD for lessons within a selected course.
 *
 * The admin first picks a course; the component then lists that course's
 * lessons and offers a create/update form.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchCourses,
  fetchLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';

const emptyForm = { module: 'General', title: '', content: '', videoUrl: '', duration: '', order: 0 };

const ManageLessons = () => {
  const { notify } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load the course list once so the admin can choose one.
  useEffect(() => {
    fetchCourses()
      .then((data) => setCourses(data.courses))
      .catch((err) => notify(err.message, 'error'));
  }, [notify]);

  // Load lessons whenever the selected course changes.
  const loadLessons = useCallback(
    async (courseId) => {
      if (!courseId) {
        setLessons([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchLessons(courseId);
        setLessons(data.lessons);
      } catch (err) {
        notify(err.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    loadLessons(selectedCourse);
  }, [selectedCourse, loadLessons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (lesson) => {
    setEditingId(lesson._id);
    setForm({
      module: lesson.module || 'General',
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || '',
      order: lesson.order ?? 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      notify('Select a course first.', 'error');
      return;
    }
    if (!form.title) {
      notify('Lesson title is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateLesson(editingId, form);
        notify('Lesson updated.', 'success');
      } else {
        // The parent course id is required by the API when creating.
        await createLesson({ ...form, course: selectedCourse, order: Number(form.order) });
        notify('Lesson created.', 'success');
      }
      resetForm();
      loadLessons(selectedCourse);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(id);
      notify('Lesson deleted.', 'success');
      if (editingId === id) resetForm();
      loadLessons(selectedCourse);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Course selector */}
      <div className="form-group" style={{ maxWidth: 360 }}>
        <label htmlFor="course-select">Select a course</label>
        <select
          id="course-select"
          className="form-control"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            resetForm();
          }}
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
          {/* Lesson list */}
          <div className="card">
            <h2>Lessons</h2>
            {loading ? (
              <Spinner label="Loading…" />
            ) : lessons.length === 0 ? (
              <p className="text-muted">No lessons for this course yet.</p>
            ) : (
              <ul className="admin-list">
                {lessons.map((l) => (
                  <li key={l._id} className="admin-list-item">
                    <div className="admin-list-item-main">
                      <strong>{l.title}</strong>
                      <span className="text-muted">
                        {l.module} · order {l.order}
                      </span>
                    </div>
                    <div className="row">
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => startEdit(l)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(l._id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Lesson form */}
          <div className="card">
            <h2>{editingId ? 'Edit lesson' : 'Add lesson'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="title">Title</label>
                  <input id="title" name="title" className="form-control" value={form.title} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="order">Order</label>
                  <input
                    id="order"
                    name="order"
                    type="number"
                    className="form-control"
                    value={form.order}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="module">Module</label>
                  <input id="module" name="module" className="form-control" value={form.module} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="lesson-duration">Duration</label>
                  <input
                    id="lesson-duration"
                    name="duration"
                    className="form-control"
                    placeholder="e.g. 12 min"
                    value={form.duration}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="videoUrl">Video URL (optional)</label>
                <input id="videoUrl" name="videoUrl" className="form-control" value={form.videoUrl} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  className="form-control"
                  rows={5}
                  value={form.content}
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update lesson' : 'Create lesson'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLessons;

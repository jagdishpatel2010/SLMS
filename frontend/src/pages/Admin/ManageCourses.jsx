/**
 * ManageCourses — admin CRUD for courses.
 *
 * Left column lists existing courses with edit/delete actions; right column is
 * a create/update form. Selecting a course loads it into the form for editing.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';

// A fresh, empty course form.
const emptyForm = {
  name: '',
  instructor: '',
  category: '',
  duration: '',
  level: 'Beginner',
  description: '',
  thumbnail: '',
};

const ManageCourses = () => {
  const { notify } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(data.courses);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reset the form back to "create" mode.
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // Populate the form to edit an existing course.
  const startEdit = (course) => {
    setEditingId(course._id);
    setForm({
      name: course.name || '',
      instructor: course.instructor || '',
      category: course.category || '',
      duration: course.duration || '',
      level: course.level || 'Beginner',
      description: course.description || '',
      thumbnail: course.thumbnail || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Minimal required-field check before hitting the API.
    if (!form.name || !form.instructor || !form.category) {
      notify('Name, instructor, and category are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateCourse(editingId, form);
        notify('Course updated.', 'success');
      } else {
        await createCourse(form);
        notify('Course created.', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Deleting a course cascades to its lessons and quizzes on the server.
    if (!window.confirm('Delete this course and all its lessons and quizzes?')) return;
    try {
      await deleteCourse(id);
      notify('Course deleted.', 'success');
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="admin-section">
      {/* List */}
      <div className="card">
        <h2>Courses</h2>
        {loading ? (
          <Spinner label="Loading…" />
        ) : courses.length === 0 ? (
          <p className="text-muted">No courses yet.</p>
        ) : (
          <ul className="admin-list">
            {courses.map((c) => (
              <li key={c._id} className="admin-list-item">
                <div className="admin-list-item-main">
                  <strong>{c.name}</strong>
                  <span className="text-muted">
                    {c.category} · {c.level}
                  </span>
                </div>
                <div className="row">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Form */}
      <div className="card">
        <h2>{editingId ? 'Edit course' : 'Add course'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Course name</label>
            <input id="name" name="name" className="form-control" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="instructor">Instructor</label>
            <input
              id="instructor"
              name="instructor"
              className="form-control"
              value={form.instructor}
              onChange={handleChange}
            />
          </div>
          <div className="row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                className="form-control"
                value={form.category}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="level">Level</label>
              <select id="level" name="level" className="form-control" value={form.level} onChange={handleChange}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              className="form-control"
              placeholder="e.g. 6 weeks"
              value={form.duration}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail URL</label>
            <input
              id="thumbnail"
              name="thumbnail"
              className="form-control"
              value={form.thumbnail}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update course' : 'Create course'}
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
  );
};

export default ManageCourses;

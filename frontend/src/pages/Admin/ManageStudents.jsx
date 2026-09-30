/**
 * ManageStudents — admin view to list students and remove accounts.
 *
 * Deleting a student cascades to their enrollments and quiz results on the
 * server.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchStudents, deleteStudent } from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner/index.js';

const ManageStudents = () => {
  const { notify } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudents();
      setStudents(data.students);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student and all their data?')) return;
    try {
      await deleteStudent(id);
      notify('Student removed.', 'success');
      load();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (loading) return <Spinner label="Loading students…" />;

  return (
    <div className="card">
      <h2>Students</h2>
      {students.length === 0 ? (
        <p className="text-muted">No students registered yet.</p>
      ) : (
        <table className="scores-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Enrollments</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.enrollmentCount}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageStudents;

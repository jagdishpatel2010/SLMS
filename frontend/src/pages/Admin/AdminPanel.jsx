/**
 * AdminPanel — admin dashboard with tabbed management sections for courses,
 * lessons, quizzes, and students. Each tab is a focused sub-component.
 */
import { useState } from 'react';
import ManageCourses from './ManageCourses.jsx';
import ManageLessons from './ManageLessons.jsx';
import ManageQuizzes from './ManageQuizzes.jsx';
import ManageStudents from './ManageStudents.jsx';
import './Admin.css';

const TABS = [
  { key: 'courses', label: 'Courses' },
  { key: 'lessons', label: 'Lessons' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'students', label: 'Students' },
];

const AdminPanel = () => {
  const [tab, setTab] = useState('courses');

  return (
    <section>
      <h1 className="page-title">Admin panel</h1>
      <p className="page-subtitle">Manage courses, lessons, quizzes, and students.</p>

      {/* Tab bar with proper ARIA roles for keyboard/screen-reader users. */}
      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`admin-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="admin-panel-body">
        {tab === 'courses' && <ManageCourses />}
        {tab === 'lessons' && <ManageLessons />}
        {tab === 'quizzes' && <ManageQuizzes />}
        {tab === 'students' && <ManageStudents />}
      </div>
    </section>
  );
};

export default AdminPanel;

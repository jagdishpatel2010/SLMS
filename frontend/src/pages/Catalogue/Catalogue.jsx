/**
 * Catalogue — course listing with search, category/level filtering, and
 * sorting. All filtering/sorting is delegated to the backend so results stay
 * consistent with the database.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchCourses, fetchCategories } from '../../services/courseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import CourseCard from '../../components/CourseCard/CourseCard.jsx';
import Spinner from '../../components/Spinner/index.js';

const Catalogue = () => {
  const { notify } = useToast();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/search/sort state drives the query sent to the backend.
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [sort, setSort] = useState('newest');

  // Load courses whenever a filter changes. Wrapped in useCallback so the
  // effect dependency list is stable.
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourses({ search, category, level, sort });
      setCourses(data.courses);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category, level, sort, notify]);

  // Fetch categories once for the filter dropdown.
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  // Debounce search so we do not query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(loadCourses, 300);
    return () => clearTimeout(timer);
  }, [loadCourses]);

  return (
    <section>
      <h1 className="page-title">Course catalogue</h1>
      <p className="page-subtitle">Find a course and start learning.</p>

      {/* Filter toolbar */}
      <div className="card catalogue-filters">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            className="form-control"
            placeholder="Search by name, instructor, or topic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="level">Level</label>
          <select
            id="level"
            className="form-control"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="all">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            className="form-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Spinner label="Loading courses…" />
      ) : courses.length === 0 ? (
        <div className="empty-state">No courses match your filters.</div>
      ) : (
        <div className="grid grid-cards" style={{ marginTop: '1.25rem' }}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Catalogue;

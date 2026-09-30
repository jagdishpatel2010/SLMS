/**
 * CourseCard — compact course summary used in the catalogue grid.
 */
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => (
  <article className="course-card card">
    {/* Thumbnail with a graceful fallback via alt text when no image is set. */}
    {course.thumbnail ? (
      <img className="course-card-thumb" src={course.thumbnail} alt={`${course.name} thumbnail`} />
    ) : (
      <div className="course-card-thumb course-card-thumb--placeholder" aria-hidden="true">
        {course.name?.charAt(0) || '?'}
      </div>
    )}

    <div className="course-card-body">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="badge">{course.category}</span>
        <span className="badge">{course.level}</span>
      </div>
      <h3 className="course-card-title">{course.name}</h3>
      <p className="text-muted course-card-instructor">By {course.instructor}</p>
      <p className="course-card-desc">{course.description?.slice(0, 110)}</p>
      <Link to={`/courses/${course._id}`} className="btn btn-sm">
        View details
      </Link>
    </div>
  </article>
);

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    instructor: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
  }).isRequired,
};

export default CourseCard;

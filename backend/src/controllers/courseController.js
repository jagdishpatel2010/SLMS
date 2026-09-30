/**
 * Course controller.
 *
 * Public: list courses (with search/filter/sort) and view a single course.
 * Admin-only: create, update, delete courses.
 */
import { Op } from 'sequelize';
import { Course, Lesson, Quiz, Question, sequelize } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Map the sort query value to a Sequelize order array.
 *
 * @param {string} sort - One of: newest, oldest, name-asc, name-desc.
 * @returns {Array} Sequelize order specification.
 */
const buildOrder = (sort) => {
  switch (sort) {
    case 'oldest':
      return [['createdAt', 'ASC']];
    case 'name-asc':
      return [['name', 'ASC']];
    case 'name-desc':
      return [['name', 'DESC']];
    case 'newest':
    default:
      return [['createdAt', 'DESC']];
  }
};

/**
 * GET /api/courses
 * List courses with optional search, category/level filters, and sorting.
 */
export const getCourses = asyncHandler(async (req, res) => {
  const { search, category, level, sort } = req.query;

  // Build the WHERE clause from an allowlist of query params only.
  const where = {};

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    // Case-insensitive partial match on name/instructor/description.
    where[Op.or] = [
      { name: { [Op.iLike]: term } },
      { instructor: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
    ];
  }
  if (category && category !== 'all') where.category = category;
  if (level && level !== 'all') where.level = level;

  const courses = await Course.findAll({ where, order: buildOrder(sort) });

  res.json({ success: true, count: courses.length, courses });
});

/**
 * GET /api/courses/:id
 * Return a single course together with its lessons and quiz summaries.
 */
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [
      { model: Lesson, as: 'lessons' },
      { model: Quiz, as: 'quizzes', include: [{ model: Question, as: 'questions' }] },
    ],
    order: [[{ model: Lesson, as: 'lessons' }, 'order', 'ASC']],
  });
  if (!course) throw new ApiError(404, 'Course not found.');

  // Convert to a plain object so we can reshape quizzes safely.
  const plain = course.toJSON();

  // Only expose quiz metadata here (title + question count), never answers.
  plain.quizzes = (plain.quizzes || []).map((q) => ({
    _id: q.id,
    title: q.title,
    questionCount: q.questions ? q.questions.length : 0,
  }));

  res.json({ success: true, course: plain });
});

/**
 * GET /api/courses/meta/categories
 * Return the distinct set of categories for building filter dropdowns.
 */
export const getCategories = asyncHandler(async (req, res) => {
  const rows = await Course.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
    raw: true,
  });
  const categories = rows.map((r) => r.category).filter(Boolean).sort();
  res.json({ success: true, categories });
});

/**
 * POST /api/courses  (admin)
 * Create a course.
 */
export const createCourse = asyncHandler(async (req, res) => {
  const { name, instructor, category, duration, level, description, thumbnail } = req.body;

  const course = await Course.create({
    name,
    instructor,
    category,
    duration,
    level,
    description,
    thumbnail,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, course });
});

/**
 * PUT /api/courses/:id  (admin)
 * Update a course.
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');

  // Only copy known, allowed fields to avoid mass-assignment of unexpected keys.
  const allowed = ['name', 'instructor', 'category', 'duration', 'level', 'description', 'thumbnail'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) course[key] = req.body[key];
  });
  await course.save();

  res.json({ success: true, course });
});

/**
 * DELETE /api/courses/:id  (admin)
 * Delete a course. Lessons and quizzes cascade via FK constraints.
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');

  await course.destroy();

  res.json({ success: true, message: 'Course and related content deleted.' });
});

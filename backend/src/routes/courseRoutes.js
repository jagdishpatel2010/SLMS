/**
 * Course routes.
 *
 * GET    /api/courses                 (public)  list + search/filter/sort
 * GET    /api/courses/meta/categories (public)  distinct categories
 * GET    /api/courses/:id             (public)  course detail + lessons/quizzes
 * POST   /api/courses                 (admin)   create
 * PUT    /api/courses/:id             (admin)   update
 * DELETE /api/courses/:id             (admin)   delete
 * POST   /api/courses/:id/enroll      (student) enroll
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCourses,
  getCourse,
  getCategories,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { enroll } from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const courseRules = [
  body('name').trim().notEmpty().withMessage('Course name is required.'),
  body('instructor').trim().notEmpty().withMessage('Instructor is required.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced.'),
];

// Public reads.
router.get('/', getCourses);
router.get('/meta/categories', getCategories);
router.get('/:id', getCourse);

// Student enrollment.
router.post('/:id/enroll', protect, authorize('student', 'admin'), enroll);

// Admin writes.
router.post('/', protect, authorize('admin'), courseRules, validate, createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

export default router;

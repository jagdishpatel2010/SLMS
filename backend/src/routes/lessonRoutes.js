/**
 * Lesson routes.
 *
 * GET    /api/lessons/:courseId  (auth)   lessons for a course
 * POST   /api/lessons            (admin)  create
 * PUT    /api/lessons/:id        (admin)  update
 * DELETE /api/lessons/:id        (admin)  delete
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getLessonsForCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const lessonRules = [
  body('course').notEmpty().withMessage('Parent course id is required.'),
  body('title').trim().notEmpty().withMessage('Lesson title is required.'),
];

// Authenticated users can read lessons (they view them while learning).
router.get('/:courseId', protect, getLessonsForCourse);

// Admin-only writes.
router.post('/', protect, authorize('admin'), lessonRules, validate, createLesson);
router.put('/:id', protect, authorize('admin'), updateLesson);
router.delete('/:id', protect, authorize('admin'), deleteLesson);

export default router;

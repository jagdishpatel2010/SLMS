/**
 * Quiz routes.
 *
 * GET    /api/quizzes/:courseId     (auth)   quizzes for a course (no answers)
 * GET    /api/quizzes/single/:id    (auth)   one quiz to take (no answers)
 * POST   /api/quizzes               (admin)  create with answer key
 * PUT    /api/quizzes/:id           (admin)  update
 * DELETE /api/quizzes/:id           (admin)  delete
 * POST   /api/quizzes/:id/submit    (auth)   submit answers, get graded result
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getQuizzesForCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const quizRules = [
  body('course').notEmpty().withMessage('Parent course id is required.'),
  body('title').trim().notEmpty().withMessage('Quiz title is required.'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required.'),
];

// Reads (authenticated) — order matters: put the specific "single" and
// "submit" routes so they are not shadowed by the :courseId param route.
router.get('/single/:id', protect, getQuiz);
router.get('/:courseId', protect, getQuizzesForCourse);

// Submission (authenticated student).
router.post('/:id/submit', protect, submitQuiz);

// Admin writes.
router.post('/', protect, authorize('admin'), quizRules, validate, createQuiz);
router.put('/:id', protect, authorize('admin'), updateQuiz);
router.delete('/:id', protect, authorize('admin'), deleteQuiz);

export default router;

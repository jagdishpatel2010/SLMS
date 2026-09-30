/**
 * Enrollment routes (all require an authenticated student/admin).
 *
 * GET   /api/enrollments                                   list my enrollments
 * GET   /api/enrollments/:courseId                         my enrollment for a course
 * PATCH /api/enrollments/:courseId/lessons/:lessonId/complete  mark lesson done
 */
import { Router } from 'express';
import {
  getMyEnrollments,
  getEnrollmentForCourse,
  markLessonComplete,
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Every enrollment route needs an authenticated user.
router.use(protect);

router.get('/', getMyEnrollments);
router.get('/:courseId', getEnrollmentForCourse);
router.patch('/:courseId/lessons/:lessonId/complete', markLessonComplete);

export default router;

/**
 * Admin routes (all require the admin role).
 *
 * GET    /api/admin/students      list students
 * DELETE /api/admin/students/:id  remove a student
 */
import { Router } from 'express';
import { getStudents, deleteStudent } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Guard the whole router: authenticated AND admin only.
router.use(protect, authorize('admin'));

router.get('/students', getStudents);
router.delete('/students/:id', deleteStudent);

export default router;

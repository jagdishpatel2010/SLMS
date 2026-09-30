/**
 * Progress routes.
 *
 * GET /api/progress  (auth)  the current user's learning-progress summary
 */
import { Router } from 'express';
import { getMyProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyProgress);

export default router;

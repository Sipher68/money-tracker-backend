import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticateFirebaseToken);

// User routes will be implemented here
router.get('/profile', (req: Request, res: Response) => {
  res.json({ message: 'User profile routes - coming soon' });
});

export default router;

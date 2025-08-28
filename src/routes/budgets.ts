import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticateFirebaseToken);

// Budget routes will be implemented here
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Budget routes - coming soon' });
});

export default router;

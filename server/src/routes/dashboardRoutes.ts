import { Router, Response, NextFunction } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// Optional auth middleware so public visitors get overall stats, while authenticated users get tailored stats
const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'civicconnect_super_secret_jwt_key_2026_academic_demo';
      const decoded: any = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};

router.get('/stats', optionalAuthenticate, getDashboardStats);

export default router;

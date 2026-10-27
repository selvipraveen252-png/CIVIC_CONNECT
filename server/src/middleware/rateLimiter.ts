import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../config/redis';

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const memoryStore: RateLimitStore = {};

export const rateLimiter = (options: { windowMs?: number; max?: number; message?: string } = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max || 120; // 120 requests per minute
  const message = options.message || 'Too many requests from this IP, please try again after a minute.';

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const key = `ratelimit:${ip}`;
    const now = Date.now();

    try {
      const cached = await getCache(key);
      if (cached) {
        const count = parseInt(cached, 10);
        if (count >= max) {
          res.status(429).json({ success: false, message });
          return;
        }
        await setCache(key, (count + 1).toString(), Math.ceil(windowMs / 1000));
      } else {
        await setCache(key, '1', Math.ceil(windowMs / 1000));
      }
      next();
    } catch {
      // Memory fallback
      const record = memoryStore[ip];
      if (!record || now > record.resetTime) {
        memoryStore[ip] = { count: 1, resetTime: now + windowMs };
        next();
      } else {
        if (record.count >= max) {
          res.status(429).json({ success: false, message });
          return;
        }
        record.count++;
        next();
      }
    }
  };
};

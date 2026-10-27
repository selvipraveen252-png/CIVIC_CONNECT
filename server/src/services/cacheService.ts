import { getCache, setCache, deleteCachePattern } from '../config/redis';

export const cacheService = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await getCache(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  set: async <T>(key: string, value: T, ttlSeconds: number = 120): Promise<void> => {
    try {
      await setCache(key, JSON.stringify(value), ttlSeconds);
    } catch {
      // ignore
    }
  },

  invalidate: async (pattern: string): Promise<void> => {
    try {
      await deleteCachePattern(pattern);
    } catch {
      // ignore
    }
  },
};

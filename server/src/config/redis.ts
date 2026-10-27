import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;
let isRedisConnected = false;

// In-memory fallback cache when Redis is not available
const inMemoryCache = new Map<string, { value: string; expiry: number }>();

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: () => null, // Do not reconnect infinitely if Redis is offline
    });

    redisClient.connect().then(() => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully to Redis server');
    }).catch((err) => {
      console.log('[Redis] Redis not available, using in-memory cache fallback. (Optional feature)');
      redisClient = null;
    });
  } catch (err) {
    console.log('[Redis] Initialization skipped, using fallback.');
    redisClient = null;
  }
} else {
  console.log('[Redis] REDIS_URL not provided, running with in-memory caching fallback.');
}

export const getCache = async (key: string): Promise<string | null> => {
  if (isRedisConnected && redisClient) {
    try {
      return await redisClient.get(key);
    } catch {
      // Fall through to memory
    }
  }

  const cached = inMemoryCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    inMemoryCache.delete(key);
    return null;
  }
  return cached.value;
};

export const setCache = async (key: string, value: string, ttlSeconds: number = 60): Promise<void> => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, value, 'EX', ttlSeconds);
      return;
    } catch {
      // Fall through
    }
  }

  inMemoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // ignore
    }
  }

  // Clear memory cache matching prefix/pattern
  const cleanPattern = pattern.replace('*', '');
  for (const key of inMemoryCache.keys()) {
    if (key.includes(cleanPattern)) {
      inMemoryCache.delete(key);
    }
  }
};

export default { getCache, setCache, deleteCachePattern };

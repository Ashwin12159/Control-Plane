import Redis from "ioredis";

// In-memory cache fallback
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data: value, expiresAt });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Redis client instance
let redisClient: Redis | null = null;
let inMemoryCache: InMemoryCache | null = null;

/**
 * Initialize Redis client or fallback to in-memory cache
 */
function initializeCache(): Redis | InMemoryCache {
  // Try to connect to Redis if URL is provided
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || "localhost";
  const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  if (redisUrl || redisHost) {
    try {
      const client = redisUrl
        ? new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
              if (times > 3) {
                console.warn("Redis connection failed, falling back to in-memory cache");
                return null; // Stop retrying
              }
              return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
          })
        : new Redis({
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
              if (times > 3) {
                console.warn("Redis connection failed, falling back to in-memory cache");
                return null;
              }
              return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
          });

      // Set up error handlers
      client.on("error", (error) => {
        console.warn("Redis error, falling back to in-memory cache:", error.message);
        redisClient = null;
      });

      client.on("connect", () => {
        console.log("Redis connected successfully");
      });

      // Try to connect (non-blocking)
      client.connect().catch((error) => {
        console.warn("Redis connection failed, using in-memory cache:", error.message);
        redisClient = null;
      });

      redisClient = client;
      return client;
    } catch (error) {
      console.warn("Failed to initialize Redis, using in-memory cache:", error);
    }
  }

  // Fallback to in-memory cache
  if (!inMemoryCache) {
    inMemoryCache = new InMemoryCache();
  }
  return inMemoryCache;
}

/**
 * Get cache instance (Redis or in-memory)
 */
function getCache(): Redis | InMemoryCache {
  if (redisClient) {
    return redisClient;
  }
  if (inMemoryCache) {
    return inMemoryCache;
  }
  return initializeCache();
}

/**
 * Get value from cache
 */
export async function getCacheValue<T>(key: string): Promise<T | null> {
  const cache = getCache();

  if (cache instanceof Redis) {
    try {
      const value = await cache.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  } else {
    // In-memory cache
    return cache.get<T>(key);
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCacheValue<T>(
  key: string,
  value: T,
  ttlSeconds: number = 600
): Promise<void> {
  const cache = getCache();

  if (cache instanceof Redis) {
    try {
      await cache.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  } else {
    // In-memory cache (ttl in milliseconds)
    cache.set(key, value, ttlSeconds * 1000);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCacheValue(key: string): Promise<void> {
  const cache = getCache();

  if (cache instanceof Redis) {
    try {
      await cache.del(key);
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  } else {
    // In-memory cache
    cache.delete(key);
  }
}

/**
 * Generate cache key for complete call details
 */
export function getCompleteCallDetailsCacheKey(
  region: string,
  callId: string,
  practiceId?: string
): string {
  const practicePart = practiceId ? `_${practiceId}` : "";
  return `call_details:${region}:${callId}${practicePart}`;
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeCache(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}


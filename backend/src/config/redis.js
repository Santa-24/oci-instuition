import { ENV } from './env.js';

class ResilientCacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.hasRedis = Boolean(ENV.REDIS_URL && ENV.REDIS_TOKEN);
    if (this.hasRedis) {
      console.log('[Cache] Upstash Redis configured.');
    } else {
      console.log('[Cache] Upstash Redis not configured. Operating with high-performance In-Memory TTL Cache.');
    }
  }

  async get(key) {
    // 1. If Redis is configured, query Upstash REST API
    if (this.hasRedis) {
      try {
        const res = await fetch(`${ENV.REDIS_URL}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${ENV.REDIS_TOKEN}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result !== null) {
            try { return JSON.parse(data.result); } catch (_) { return data.result; }
          }
        }
      } catch (err) {
        console.warn(`[Redis Error] get failed for key "${key}", falling back to memory:`, err.message);
      }
    }

    // 2. Memory Cache fallback
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, ttlSeconds = 300) {
    // 1. Memory Cache
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // 2. Redis if configured
    if (this.hasRedis) {
      try {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await fetch(`${ENV.REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(valStr)}?ex=${ttlSeconds}`, {
          headers: { Authorization: `Bearer ${ENV.REDIS_TOKEN}` },
        });
      } catch (err) {
        console.warn(`[Redis Error] set failed for key "${key}":`, err.message);
      }
    }
  }

  async del(key) {
    this.memoryCache.delete(key);
    if (this.hasRedis) {
      try {
        await fetch(`${ENV.REDIS_URL}/del/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${ENV.REDIS_TOKEN}` },
        });
      } catch (err) {
        console.warn(`[Redis Error] del failed for key "${key}":`, err.message);
      }
    }
  }
}

export const Cache = new ResilientCacheManager();
export const CacheManager = Cache;

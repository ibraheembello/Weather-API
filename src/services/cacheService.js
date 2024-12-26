import Redis from 'ioredis';
import dotenv from 'dotenv';
import { ApiError } from '../middleware/errorHandler.js';

dotenv.config();

class RedisClient {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Successfully connected to Redis');
    });
  }

  async get(key) {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      throw new ApiError(503, 'Cache service unavailable');
    }
  }

  async set(key, value, ttl) {
    try {
      await this.redis.set(key, value, 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      throw new ApiError(503, 'Cache service unavailable');
    }
  }
}

const redisClient = new RedisClient();
const CACHE_TTL = process.env.CACHE_TTL || 43200;

export const getCachedData = (key) => redisClient.get(key);
export const setCachedData = (key, value) => redisClient.set(key, value, CACHE_TTL);

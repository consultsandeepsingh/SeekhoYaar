import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../shared/utils/logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    redisClient.on('error', (err) => logger.error('❌ Redis error', { err }));
  }
  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  await getRedisClient().connect();
};
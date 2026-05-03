import { Next } from 'koa';
import { AppContext } from '../types/koa.types';
import { getRedisClient } from '../../config/redis';
import { AppError } from '../errors/AppError';
import { env } from '../../config/env';

/**
 * Redis-based sliding window rate limiter
 */
export const rateLimiter =
  (maxRequests = parseInt(env.RATE_LIMIT_MAX), windowMs = parseInt(env.RATE_LIMIT_WINDOW_MS)) =>
  async (ctx: AppContext, next: Next): Promise<void> => {
    const redis = getRedisClient();
    const key = `rate:${ctx.ip}:${ctx.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    await redis.zremrangebyscore(key, '-inf', windowStart);
    const count = await redis.zcard(key);

    if (count >= maxRequests) {
      ctx.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      throw new AppError('Too many requests. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED');
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.pexpire(key, windowMs);

    ctx.set('X-RateLimit-Limit', String(maxRequests));
    ctx.set('X-RateLimit-Remaining', String(maxRequests - count - 1));

    await next();
  };
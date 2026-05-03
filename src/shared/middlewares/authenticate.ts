import { Next } from 'koa';
import { AppContext } from '../types/koa.types';
import { JwtUtils } from '../utils/jwt.utils';
import { UnauthorizedError } from '../errors/AppError';

/**
 * Validates JWT Bearer token and injects user into ctx.state
 */
export const authenticate = async (ctx: AppContext, next: Next): Promise<void> => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization header missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = JwtUtils.verifyAccessToken(token);
    ctx.state.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    await next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
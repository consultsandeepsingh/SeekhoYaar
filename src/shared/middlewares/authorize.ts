import { Next } from 'koa';
import { AppContext } from '../types/koa.types';
import { ForbiddenError } from '../errors/AppError';
import { UserRole } from '../types';

/**
 * Role-based access control middleware factory
 */
export const authorize = (...roles: UserRole[]) =>
  async (ctx: AppContext, next: Next): Promise<void> => {
    if (!roles.includes(ctx.state.user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`);
    }
    await next();
  };
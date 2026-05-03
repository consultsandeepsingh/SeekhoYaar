import { Context, Next } from 'koa';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

/**
 * Global Koa error handler - must be first middleware
 */
export const errorHandler = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (err: unknown) {
    const requestId = ctx.state.requestId as string | undefined;

    if (err instanceof ValidationError) {
      ctx.status = 422;
      ctx.body = {
        success: false,
        code: err.code,
        message: err.message,
        errors: err.errors,
        requestId,
      };
      return;
    }

    if (err instanceof AppError && err.isOperational) {
      ctx.status = err.statusCode;
      ctx.body = {
        success: false,
        code: err.code,
        message: err.message,
        requestId,
      };
      logger.warn('Operational error', { code: err.code, message: err.message, requestId });
      return;
    }

    // Unexpected errors
    const error = err as Error;
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack,
      requestId,
    });

    ctx.status = 500;
    ctx.body = {
      success: false,
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
      requestId,
    };
  }
};
import { Next } from 'koa';
import { ZodSchema } from 'zod';
import { AppContext } from '../types/koa.types';
import { ValidationError } from '../errors/AppError';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory
 * Usage: validate(schema, 'body')
 */
export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  async (ctx: AppContext, next: Next): Promise<void> => {
    const data =
      target === 'body'
        ? ctx.request.body
        : target === 'query'
        ? ctx.query
        : ctx.params;

    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ValidationError(result.error.issues);
    }

    // Attach parsed data back
    if (target === 'body') (ctx.request as any).validatedBody = result.data;
    else if (target === 'query') (ctx as any).validatedQuery = result.data;
    else (ctx as any).validatedParams = result.data;

    await next();
  };
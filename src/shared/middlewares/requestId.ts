import { Context, Next } from 'koa';
import { v4 as uuidv4 } from 'uuid';

export const requestId = async (ctx: Context, next: Next): Promise<void> => {
  const id = (ctx.headers['x-request-id'] as string) || uuidv4();
  ctx.state.requestId = id;
  ctx.set('X-Request-ID', id);
  await next();
};
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import koaLogger from 'koa-logger';
import { koaSwagger } from 'koa2-swagger-ui';

import { errorHandler } from './shared/middlewares/errorHandler';
import { requestId } from './shared/middlewares/requestId';
import { logger } from './shared/utils/logger';
import { swaggerSpec } from './config/swagger';

import authRouter from './modules/auth/auth.routes';
import aiTutorRouter from './modules/ai-tutor/ai-tutor.routes';

const app = new Koa();

// ── Middleware Stack (ORDER MATTERS) ──────────────────────────────────────────
app.use(errorHandler);       // 1. Catch all errors first
app.use(requestId);          // 2. Attach request ID
app.use(                     // 3. HTTP logging
  koaLogger((str) => logger.info(str))
);
app.use(helmet());           // 4. Security headers
app.use(cors({ credentials: true, origin: '*' }));  // 5. CORS
app.use(bodyParser({ jsonLimit: '10mb' }));          // 6. Parse body

// ── Swagger Docs ──────────────────────────────────────────────────────────────
app.use(
  koaSwagger({
    routePrefix: '/docs',
    swaggerOptions: { spec: swaggerSpec },
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(aiTutorRouter.routes()).use(aiTutorRouter.allowedMethods());

// ── Health Check ──────────────────────────────────────────────────────────────
app.use(async (ctx) => {
  if (ctx.path === '/api/v1/health' && ctx.method === 'GET') {
    ctx.status = 200;
    ctx.body = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    };
  }
});

export default app;
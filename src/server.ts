import app from './app';
import { env } from './config/env';
import { connectDatabases, disconnectDatabases } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './shared/utils/logger';

let server: ReturnType<typeof app.listen>;

const start = async (): Promise<void> => {
  try {
    // Connect all services
    await connectDatabases();
    await connectRedis();

    // Start HTTP server
    server = app.listen(parseInt(env.PORT), () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📖 Swagger docs: http://localhost:${env.PORT}/docs`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    process.exit(1);
  }
};

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received - gracefully shutting down...`);

  server?.close(async () => {
    await disconnectDatabases();
    logger.info('✅ Server shut down cleanly');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => process.exit(1), 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

start();
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // App
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // PostgreSQL
  DATABASE_URL: z.string().url(),

  // MongoDB
  MONGO_URI: z.string(),

  // MySQL
  MYSQL_HOST: z.string().default('localhost'),
  MYSQL_PORT: z.string().default('3306'),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),

  // Active DB driver
  DB_DRIVER: z.enum(['postgres', 'mongodb', 'mysql']).default('postgres'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // OpenAI
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4o'),

  // Queue
  QUEUE_DRIVER: z.enum(['kafka', 'rabbitmq']).default('rabbitmq'),
  KAFKA_BROKER: z.string().default('localhost:9092'),
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('30'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
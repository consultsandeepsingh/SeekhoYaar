import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import mysql2 from 'mysql2/promise';
import { env } from './env';
import { logger } from '../shared/utils/logger';

// ─── PostgreSQL (Prisma) ──────────────────────────────────────────────────────
let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
  }
  return prismaInstance;
};

// ─── MongoDB (Mongoose) ───────────────────────────────────────────────────────
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { error });
    throw error;
  }
};

// ─── MySQL ────────────────────────────────────────────────────────────────────
let mysqlPool: mysql2.Pool | null = null;

export const getMySQLPool = (): mysql2.Pool => {
  if (!mysqlPool) {
    mysqlPool = mysql2.createPool({
      host: env.MYSQL_HOST,
      port: parseInt(env.MYSQL_PORT),
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
    });
    logger.info('✅ MySQL pool created');
  }
  return mysqlPool;
};

// ─── Connect All Databases ────────────────────────────────────────────────────
export const connectDatabases = async (): Promise<void> => {
  switch (env.DB_DRIVER) {
    case 'postgres': {
      const prisma = getPrismaClient();
      await prisma.$connect();
      logger.info('✅ PostgreSQL connected via Prisma');
      break;
    }
    case 'mongodb':
      await connectMongoDB();
      break;
    case 'mysql':
      getMySQLPool();
      break;
  }
};

export const disconnectDatabases = async (): Promise<void> => {
  if (prismaInstance) await prismaInstance.$disconnect();
  if (mongoose.connection.readyState) await mongoose.disconnect();
  if (mysqlPool) await mysqlPool.end();
};
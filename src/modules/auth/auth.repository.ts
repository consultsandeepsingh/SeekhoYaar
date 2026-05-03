import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../config/database';
import { IRegisterInput, IUser } from './auth.model';
import { HashUtils } from '../../shared/utils/hash.utils';

/**
 * Auth Repository - ONLY DB operations, zero business logic
 */
export class AuthRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = getPrismaClient();
  }

  /**
   * Creates user + student profile in a single transaction
   */
  async createUserWithStudent(data: IRegisterInput): Promise<IUser> {
    return this.db.user.create({
      data: {
        email: data.email,
        passwordHash: await HashUtils.hash(data.password),
        role: 'STUDENT',
        student: {
          create: {
            name: data.name,
            college: data.college,
            branch: data.branch,
            semester: data.semester,
            phone: data.phone,
          },
        },
      },
    }) as Promise<IUser>;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.db.user.findUnique({ where: { email } }) as Promise<IUser | null>;
  }

  async findById(id: string): Promise<IUser | null> {
    return this.db.user.findUnique({ where: { id } }) as Promise<IUser | null>;
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    // Store in Redis with expiry
    const redis = (await import('../../config/redis')).getRedisClient();
    await redis.set(`refresh:${userId}`, token, 'EX', 60 * 60 * 24 * 7);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const redis = (await import('../../config/redis')).getRedisClient();
    return redis.get(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const redis = (await import('../../config/redis')).getRedisClient();
    await redis.del(`refresh:${userId}`);
  }
}
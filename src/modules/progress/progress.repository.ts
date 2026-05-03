import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../config/database';

export class ProgressRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = getPrismaClient();
  }

  async upsertProgress(
    studentId: string,
    subject: string,
    topic: string,
    scoreIncrement: number
  ) {
    return this.db.learningProgress.upsert({
      where: { studentId_subject_topic: { studentId, subject, topic } },
      update: {
        proficiencyScore: { increment: scoreIncrement },
        totalQuestions: { increment: 1 },
        lastAccessed: new Date(),
      },
      create: {
        studentId,
        subject,
        topic,
        proficiencyScore: scoreIncrement,
        totalQuestions: 1,
      },
    });
  }

  async getProgressByStudent(studentId: string) {
    return this.db.learningProgress.findMany({
      where: { studentId },
      orderBy: { lastAccessed: 'desc' },
    });
  }

  async getProgressSummary(studentId: string) {
    return this.db.learningProgress.groupBy({
      by: ['subject'],
      where: { studentId },
      _avg: { proficiencyScore: true },
      _sum: { totalQuestions: true },
    });
  }
}
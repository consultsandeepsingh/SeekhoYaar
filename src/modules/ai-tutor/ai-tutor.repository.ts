import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../../config/database';
import { IQuestionRecord } from './ai-tutor.model';
import { OrchestratorOutput } from '../../ai/orchestrator';

/**
 * AI Tutor Repository - ONLY DB queries
 */
export class AiTutorRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = getPrismaClient();
  }

  async createQuestion(
    studentId: string,
    rawText: string,
    sessionId?: string
  ): Promise<IQuestionRecord> {
    return this.db.question.create({
      data: {
        studentId,
        rawText,
        detectedLanguage: 'unknown',
        status: 'PENDING',
        sessionId,
      },
    }) as Promise<IQuestionRecord>;
  }

  async updateQuestionStatus(
    questionId: string,
    status: 'PROCESSING' | 'ANSWERED' | 'FAILED'
  ): Promise<void> {
    await this.db.question.update({
      where: { id: questionId },
      data: { status },
    });
  }

  async saveAIResponse(
    questionId: string,
    result: OrchestratorOutput
  ): Promise<void> {
    await this.db.$transaction([
      this.db.question.update({
        where: { id: questionId },
        data: {
          detectedLanguage: result.detectedLanguage,
          translatedText: result.translatedText,
          subject: result.subject,
          topic: result.topic,
          status: 'ANSWERED',
        },
      }),
      this.db.aIResponse.create({
        data: {
          questionId,
          explanation: result.explanation,
          hindiExplanation: result.hindiExplanation,
          examples: result.examples,
          followUpQuestions: result.followUpQuestions,
          agentPipeline: 'langDetect→qAnalyze→personalize→generate',
          tokensUsed: result.tokensUsed,
          confidenceScore: result.confidenceScore,
          processingMs: result.processingMs,
        },
      }),
    ]);
  }

  async findQuestionWithResponse(questionId: string) {
    return this.db.question.findUnique({
      where: { id: questionId },
      include: { aiResponse: true },
    });
  }

  async getStudentHistory(studentId: string, page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.db.question.findMany({
        where: { studentId },
        include: { aiResponse: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.question.count({ where: { studentId } }),
    ]);
    return { data, total };
  }

  async saveFeedback(questionId: string, score: number): Promise<void> {
    await this.db.question.update({
      where: { id: questionId },
      data: { feedbackScore: score },
    });
  }

  async getStudentContext(studentId: string, subject: string, topic: string) {
    const [student, progress] = await Promise.all([
      this.db.student.findUnique({ where: { id: studentId } }),
      this.db.learningProgress.findFirst({
        where: { studentId, subject, topic },
      }),
    ]);
    return { student, progress };
  }
}
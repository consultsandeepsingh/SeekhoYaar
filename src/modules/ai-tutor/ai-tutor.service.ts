import { AiTutorRepository } from './ai-tutor.repository';
import { IAITutorResponse, IAskQuestionInput } from './ai-tutor.model';
import { AIOrchestrator } from '../../ai/orchestrator';
import { RabbitMQProducer } from '../../queue/rabbitmq/rabbitmq.producer';
import { NotFoundError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';
import { LanguagePreference, LearningLevel } from '../../shared/types';

/**
 * AI Tutor Service
 * Orchestrates question processing, async or sync
 */
export class AiTutorService {
  private readonly orchestrator = new AIOrchestrator();
  private readonly queueProducer = new RabbitMQProducer();

  constructor(private readonly repository: AiTutorRepository) {}

  /**
   * Handles student question:
   * 1. Save question to DB
   * 2. Push to queue for async processing
   * Returns questionId immediately (non-blocking)
   */
  async askQuestion(
    studentId: string,
    input: IAskQuestionInput
  ): Promise<{ questionId: string; message: string }> {
    // Create question record
    const question = await this.repository.createQuestion(
      studentId,
      input.question,
      input.sessionId
    );

    // Push to queue for background processing
    await this.queueProducer.publish('AI_PROCESS_QUESTION', {
      questionId: question.id,
      studentId,
      rawText: input.question,
      preferredLanguage: input.language ?? 'hinglish',
      learningLevel: input.level ?? 'beginner',
    });

    logger.info('Question queued for processing', { questionId: question.id, studentId });

    return {
      questionId: question.id,
      message: 'Question submitted. Polling /ai/questions/:id for result.',
    };
  }

  /**
   * Direct (synchronous) question processing for real-time use
   */
  async askQuestionSync(
    studentId: string,
    input: IAskQuestionInput
  ): Promise<IAITutorResponse> {
    const question = await this.repository.createQuestion(
      studentId,
      input.question,
      input.sessionId
    );

    await this.repository.updateQuestionStatus(question.id, 'PROCESSING');

    // Fetch student context for personalization
    const { student, progress } = await this.repository.getStudentContext(
      studentId,
      'unknown', // will be determined by analyzer agent
      'unknown'
    );

    const studentContext = {
      preferredLanguage: (student?.preferredLanguage?.toLowerCase() ?? input.language ?? 'hinglish') as LanguagePreference,
      learningLevel: (student?.learningLevel?.toLowerCase() ?? input.level ?? 'beginner') as LearningLevel,
      proficiencyScore: progress?.proficiencyScore ?? 50,
      totalQuestionsOnTopic: progress?.totalQuestions ?? 0,
    };

    try {
      const result = await this.orchestrator.process({
        rawText: input.question,
        studentContext,
      });

      await this.repository.saveAIResponse(question.id, result);

      return {
        questionId: question.id,
        explanation: result.explanation,
        hindiExplanation: result.hindiExplanation,
        examples: result.examples,
        followUpQuestions: result.followUpQuestions,
        summary: result.summary,
        subject: result.subject,
        topic: result.topic,
        detectedLanguage: result.detectedLanguage,
        processingMs: result.processingMs,
      };
    } catch (error) {
      await this.repository.updateQuestionStatus(question.id, 'FAILED');
      throw error;
    }
  }

  async getQuestionById(questionId: string, studentId: string): Promise<IAITutorResponse> {
    const record = await this.repository.findQuestionWithResponse(questionId);

    if (!record || record.studentId !== studentId) {
      throw new NotFoundError('Question');
    }

    return {
      questionId: record.id,
      explanation: record.aiResponse?.explanation ?? 'Processing...',
      hindiExplanation: record.aiResponse?.hindiExplanation ?? undefined,
      examples: (record.aiResponse?.examples as string[]) ?? [],
      followUpQuestions: (record.aiResponse?.followUpQuestions as string[]) ?? [],
      summary: '',
      subject: record.subject ?? '',
      topic: record.topic ?? '',
      detectedLanguage: record.detectedLanguage,
      processingMs: record.aiResponse?.processingMs ?? 0,
    };
  }

  async getHistory(studentId: string, page: number, limit: number) {
    const { data, total } = await this.repository.getStudentHistory(studentId, page, limit);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async submitFeedback(questionId: string, studentId: string, score: number): Promise<void> {
    const record = await this.repository.findQuestionWithResponse(questionId);
    if (!record || record.studentId !== studentId) {
      throw new NotFoundError('Question');
    }
    await this.repository.saveFeedback(questionId, score);
  }
}
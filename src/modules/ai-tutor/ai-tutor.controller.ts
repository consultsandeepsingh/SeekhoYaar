import { Next } from 'koa';
import { AppContext } from '../../shared/types/koa.types';
import { AiTutorService } from './ai-tutor.service';
import { ResponseUtils } from '../../shared/utils/response.utils';
import { AskQuestionInput } from './ai-tutor.schema';

export class AiTutorController {
  constructor(private readonly aiTutorService: AiTutorService) {}

  /**
   * POST /api/v1/ai/ask
   * Sync endpoint - waits for AI response
   */
  askQuestion = async (ctx: AppContext, _next: Next): Promise<void> => {
    const body = (ctx.request as any).validatedBody as AskQuestionInput;
    const studentId = ctx.state.user.id;

    const result = await this.aiTutorService.askQuestionSync(studentId, body);
    ctx.status = 200;
    ctx.body = ResponseUtils.success(result, 'Question answered!', ctx.state.requestId);
  };

  /**
   * POST /api/v1/ai/ask/async
   * Async endpoint - returns jobId, client polls
   */
  askQuestionAsync = async (ctx: AppContext, _next: Next): Promise<void> => {
    const body = (ctx.request as any).validatedBody as AskQuestionInput;
    const studentId = ctx.state.user.id;

    const result = await this.aiTutorService.askQuestion(studentId, body);
    ctx.status = 202;
    ctx.body = ResponseUtils.success(result, 'Processing question...', ctx.state.requestId);
  };

  /**
   * GET /api/v1/ai/questions/:id
   */
  getQuestion = async (ctx: AppContext, _next: Next): Promise<void> => {
    const { id } = ctx.params;
    const studentId = ctx.state.user.id;

    const result = await this.aiTutorService.getQuestionById(id, studentId);
    ctx.status = 200;
    ctx.body = ResponseUtils.success(result, 'Question fetched', ctx.state.requestId);
  };

  /**
   * GET /api/v1/ai/history
   */
  getHistory = async (ctx: AppContext, _next: Next): Promise<void> => {
    const studentId = ctx.state.user.id;
    const page = parseInt(ctx.query.page as string) || 1;
    const limit = parseInt(ctx.query.limit as string) || 10;

    const result = await this.aiTutorService.getHistory(studentId, page, limit);
    ctx.status = 200;
    ctx.body = ResponseUtils.paginated(result, 'History fetched');
  };

  /**
   * POST /api/v1/ai/questions/:id/feedback
   */
  submitFeedback = async (ctx: AppContext, _next: Next): Promise<void> => {
    const { id } = ctx.params;
    const { score } = (ctx.request as any).validatedBody as { score: number };
    const studentId = ctx.state.user.id;

    await this.aiTutorService.submitFeedback(id, studentId, score);
    ctx.status = 200;
    ctx.body = ResponseUtils.success(null, 'Feedback submitted, thank you!', ctx.state.requestId);
  };
}
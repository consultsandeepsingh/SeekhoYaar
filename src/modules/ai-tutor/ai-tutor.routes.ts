import Router from '@koa/router';
import { AiTutorController } from './ai-tutor.controller';
import { AiTutorService } from './ai-tutor.service';
import { AiTutorRepository } from './ai-tutor.repository';
import { authenticate } from '../../shared/middlewares/authenticate';
import { rateLimiter } from '../../shared/middlewares/rateLimiter';
import { validate } from '../../shared/middlewares/validate';
import { askQuestionSchema, feedbackSchema } from './ai-tutor.schema';

const repository = new AiTutorRepository();
const service = new AiTutorService(repository);
const controller = new AiTutorController(service);

const router = new Router({ prefix: '/api/v1/ai' });

/**
 * @swagger
 * /api/v1/ai/ask:
 *   post:
 *     summary: Ask a doubt in Hinglish or English
 *     tags: [AI Tutor]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             question: "yeh recursion kya hota hai simple me samjhao"
 *             language: "hinglish"
 *             level: "beginner"
 */
router.post('/ask', authenticate, rateLimiter(10), validate(askQuestionSchema), controller.askQuestion);
router.post('/ask/async', authenticate, rateLimiter(20), validate(askQuestionSchema), controller.askQuestionAsync);
router.get('/questions/:id', authenticate, controller.getQuestion);
router.get('/history', authenticate, controller.getHistory);
router.post('/questions/:id/feedback', authenticate, validate(feedbackSchema), controller.submitFeedback);

export default router;
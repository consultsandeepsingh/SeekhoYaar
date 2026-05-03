import { AiTutorService } from '../modules/ai-tutor/ai-tutor.service';
import { AiTutorRepository } from '../modules/ai-tutor/ai-tutor.repository';
import { AIOrchestrator } from '../ai/orchestrator';

// Mock dependencies
jest.mock('../modules/ai-tutor/ai-tutor.repository');
jest.mock('../ai/orchestrator');
jest.mock('../queue/rabbitmq/rabbitmq.producer');

const MockRepository = AiTutorRepository as jest.MockedClass<typeof AiTutorRepository>;
const MockOrchestrator = AIOrchestrator as jest.MockedClass<typeof AIOrchestrator>;

describe('AiTutorService', () => {
  let service: AiTutorService;
  let mockRepo: jest.Mocked<AiTutorRepository>;

  const mockOrchestratorResult = {
    explanation: 'Recursion ek aisi technique hai jisme function khud ko call karta hai.',
    hindiExplanation: 'Recursion एक technique है...',
    examples: ['Factorial function', 'Fibonacci series'],
    followUpQuestions: ['What is base case?', 'Stack overflow kab hota hai?'],
    summary: 'Function calling itself repeatedly',
    subject: 'Computer Science',
    topic: 'Recursion',
    detectedLanguage: 'hinglish',
    translatedText: 'What is recursion? Explain simply.',
    tokensUsed: 350,
    confidenceScore: 0.92,
    processingMs: 1200,
  };

  beforeEach(() => {
    mockRepo = new MockRepository() as jest.Mocked<AiTutorRepository>;
    service = new AiTutorService(mockRepo);

    mockRepo.createQuestion.mockResolvedValue({
      id: 'q-123',
      studentId: 's-456',
      rawText: 'yeh recursion kya hota hai',
      detectedLanguage: 'hinglish',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepo.updateQuestionStatus.mockResolvedValue(undefined);
    mockRepo.getStudentContext.mockResolvedValue({ student: null, progress: null });
    mockRepo.saveAIResponse.mockResolvedValue(undefined);

    MockOrchestrator.prototype.process = jest.fn().mockResolvedValue(mockOrchestratorResult);
  });

  describe('askQuestionSync', () => {
    it('should process a Hinglish question and return AI response', async () => {
      const result = await service.askQuestionSync('s-456', {
        question: 'yeh recursion kya hota hai simple me samjhao',
        language: 'hinglish',
        level: 'beginner',
      });

      expect(result.questionId).toBe('q-123');
      expect(result.explanation).toContain('Recursion');
      expect(result.examples).toHaveLength(2);
      expect(result.followUpQuestions).toHaveLength(2);
      expect(mockRepo.createQuestion).toHaveBeenCalledTimes(1);
      expect(mockRepo.saveAIResponse).toHaveBeenCalledTimes(1);
    });

    it('should mark question as FAILED on AI error', async () => {
      MockOrchestrator.prototype.process = jest
        .fn()
        .mockRejectedValue(new Error('OpenAI API error'));

      await expect(
        service.askQuestionSync('s-456', {
          question: 'test question',
        })
      ).rejects.toThrow('OpenAI API error');

      expect(mockRepo.updateQuestionStatus).toHaveBeenCalledWith('q-123', 'FAILED');
    });
  });
});
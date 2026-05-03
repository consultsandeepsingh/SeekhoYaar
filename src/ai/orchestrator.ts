import { LanguageDetectorAgent } from './agents/languageDetector.agent';
import { QuestionAnalyzerAgent } from './agents/questionAnalyzer.agent';
import { PersonalizationAgent, StudentContext } from './agents/personalization.agent';
import { ResponseGeneratorAgent, GeneratedResponse } from './agents/responseGenerator.agent';
import { logger } from '../shared/utils/logger';

export interface OrchestratorInput {
  rawText: string;
  studentContext: StudentContext;
}

export interface OrchestratorOutput extends GeneratedResponse {
  detectedLanguage: string;
  subject: string;
  topic: string;
  translatedText: string;
  processingMs: number;
}

/**
 * AI Orchestrator
 * Chains all 4 agents sequentially to produce a personalized response
 */
export class AIOrchestrator {
  private readonly langDetector = new LanguageDetectorAgent();
  private readonly questionAnalyzer = new QuestionAnalyzerAgent();
  private readonly personalizationAgent = new PersonalizationAgent();
  private readonly responseGenerator = new ResponseGeneratorAgent();

  async process(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const startTime = Date.now();
    logger.info('AIOrchestrator: pipeline started', { question: input.rawText });

    // ── Step 1: Detect Language ──────────────────────────────────────────────
    const langResult = await this.langDetector.run(input.rawText);
    logger.debug('Step 1 done: Language detected', { language: langResult.language });

    // ── Step 2: Analyze Question ─────────────────────────────────────────────
    const analysisResult = await this.questionAnalyzer.run(
      langResult.normalizedText,
      langResult.language
    );
    logger.debug('Step 2 done: Question analyzed', {
      subject: analysisResult.subject,
      topic: analysisResult.topic,
    });

    // ── Step 3: Personalize ──────────────────────────────────────────────────
    const personalizationResult = await this.personalizationAgent.run(
      input.studentContext
    );
    logger.debug('Step 3 done: Personalization complete', {
      level: personalizationResult.adjustedLevel,
    });

    // ── Step 4: Generate Response ────────────────────────────────────────────
    const responseResult = await this.responseGenerator.run(
      langResult.normalizedText,
      analysisResult,
      personalizationResult
    );
    logger.debug('Step 4 done: Response generated');

    const processingMs = Date.now() - startTime;
    logger.info('AIOrchestrator: pipeline complete', { processingMs });

    return {
      ...responseResult,
      detectedLanguage: langResult.language,
      subject: analysisResult.subject,
      topic: analysisResult.topic,
      translatedText: analysisResult.translatedToEnglish,
      processingMs,
    };
  }
}
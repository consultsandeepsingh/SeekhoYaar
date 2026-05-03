import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { AIProcessingError } from '../../shared/errors/AppError';
import { buildTutorSystemPrompt } from '../prompts/tutor.prompt';
import { PersonalizationResult } from './personalization.agent';
import { QuestionAnalysis } from './questionAnalyzer.agent';

export interface GeneratedResponse {
  explanation: string;
  hindiExplanation?: string;
  examples: string[];
  followUpQuestions: string[];
  summary: string;
  tokensUsed: number;
  confidenceScore: number;
}

/**
 * Agent 4: Response Generator
 * Generates final bilingual, personalized tutoring response
 */
export class ResponseGeneratorAgent {
  private readonly model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: env.OPENAI_MODEL,
      temperature: 0.7,
    });
  }

  async run(
    question: string,
    analysis: QuestionAnalysis,
    personalization: PersonalizationResult
  ): Promise<GeneratedResponse> {
    logger.debug('ResponseGeneratorAgent: generating response');

    const systemPrompt = buildTutorSystemPrompt(
      personalization.adjustedLevel,
      personalization.responseLanguage,
      analysis.subject,
      analysis.topic,
      personalization.contextHints,
      personalization.shouldUseAnalogy
    );

    try {
      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `Student's question: "${question}"\nEnglish translation: "${analysis.translatedToEnglish}"`
        ),
      ]);

      const content = response.content as string;
      const tokensUsed = response.usage_metadata?.total_tokens ?? 0;

      // Parse JSON response from AI
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AIProcessingError('AI response was not valid JSON', 'ResponseGeneratorAgent');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Omit<
        GeneratedResponse,
        'tokensUsed' | 'confidenceScore'
      >;

      return {
        ...parsed,
        tokensUsed,
        confidenceScore: 0.92,
      };
    } catch (error) {
      if (error instanceof AIProcessingError) throw error;
      throw new AIProcessingError(
        `Response generation failed: ${(error as Error).message}`,
        'ResponseGeneratorAgent'
      );
    }
  }
}
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';
import { AIProcessingError } from '../../shared/errors/AppError';

const analysisSchema = z.object({
  subject: z.string().describe('Academic subject (e.g., Mathematics, Computer Science)'),
  topic: z.string().describe('Specific topic within the subject'),
  subtopic: z.string().optional().describe('Subtopic if applicable'),
  questionType: z.enum(['conceptual', 'procedural', 'factual', 'application']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  translatedToEnglish: z.string().describe('Clean English translation of the question'),
  intent: z.string().describe('Core intent/ask of the student'),
});

export type QuestionAnalysis = z.infer<typeof analysisSchema>;

/**
 * Agent 2: Question Analyzer
 * Extracts subject, topic, intent from the student's question using LangChain
 */
export class QuestionAnalyzerAgent {
  private readonly model: ChatOpenAI;
  private readonly parser: StructuredOutputParser<typeof analysisSchema>;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: env.OPENAI_MODEL,
      temperature: 0.1,
    });
    this.parser = StructuredOutputParser.fromZodSchema(analysisSchema);
  }

  async run(
    normalizedText: string,
    detectedLanguage: string
  ): Promise<QuestionAnalysis> {
    logger.debug('QuestionAnalyzerAgent: analyzing', { normalizedText });

    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = PromptTemplate.fromTemplate(`
      You are an academic question analyzer for Indian college students.
      The student may write in Hindi using English letters (Hinglish) or plain English.
      
      Detected language: {language}
      Student's question: {question}
      
      Analyze this question and extract structured information.
      {format_instructions}
    `);

    try {
      const chain = prompt.pipe(this.model).pipe(this.parser);
      const result = await chain.invoke({
        language: detectedLanguage,
        question: normalizedText,
        format_instructions: formatInstructions,
      });

      logger.debug('QuestionAnalyzerAgent: done', { subject: result.subject, topic: result.topic });
      return result;
    } catch (error) {
      throw new AIProcessingError(
        `Question analysis failed: ${(error as Error).message}`,
        'QuestionAnalyzerAgent'
      );
    }
  }
}
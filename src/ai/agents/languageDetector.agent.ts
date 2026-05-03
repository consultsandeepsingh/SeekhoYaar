import { HinglishUtils } from '../../shared/utils/hinglish.utils';
import { logger } from '../../shared/utils/logger';

export interface LanguageDetectionResult {
  language: 'hindi' | 'hinglish' | 'english';
  confidence: number;
  normalizedText: string;
}

/**
 * Agent 1: Language Detector
 * Detects whether student input is Hindi, Hinglish, or English
 */
export class LanguageDetectorAgent {
  async run(rawText: string): Promise<LanguageDetectionResult> {
    logger.debug('LanguageDetectorAgent: processing', { rawText });

    const language = HinglishUtils.detectLanguage(rawText);
    const normalizedText = HinglishUtils.normalize(rawText);

    // Confidence scoring
    const confidence = language === 'english' ? 0.9 : 0.8;

    logger.debug('LanguageDetectorAgent: result', { language, confidence });

    return { language, confidence, normalizedText };
  }
}
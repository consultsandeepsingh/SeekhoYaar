import { LearningLevel, LanguagePreference } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export interface StudentContext {
  preferredLanguage: LanguagePreference;
  learningLevel: LearningLevel;
  proficiencyScore: number;
  totalQuestionsOnTopic: number;
}

export interface PersonalizationResult {
  responseLanguage: LanguagePreference;
  adjustedLevel: LearningLevel;
  contextHints: string[];
  shouldUseAnalogy: boolean;
}

/**
 * Agent 3: Personalization Agent
 * Adapts response based on student history and preferences
 */
export class PersonalizationAgent {
  /**
   * Upgrades difficulty if student shows mastery
   */
  private adjustLevel(context: StudentContext): LearningLevel {
    if (context.proficiencyScore >= 80 && context.learningLevel === 'beginner') {
      return 'intermediate';
    }
    if (context.proficiencyScore >= 85 && context.learningLevel === 'intermediate') {
      return 'advanced';
    }
    return context.learningLevel;
  }

  async run(context: StudentContext): Promise<PersonalizationResult> {
    logger.debug('PersonalizationAgent: personalizing', { context });

    const adjustedLevel = this.adjustLevel(context);

    const contextHints: string[] = [];
    if (context.totalQuestionsOnTopic > 5) {
      contextHints.push('Student has asked multiple questions on this topic - avoid repeating basics');
    }
    if (context.proficiencyScore < 40) {
      contextHints.push('Student struggles with this topic - use very simple language and more examples');
    }

    return {
      responseLanguage: context.preferredLanguage,
      adjustedLevel,
      contextHints,
      shouldUseAnalogy: context.learningLevel === 'beginner' || context.proficiencyScore < 50,
    };
  }
}
import { IBaseModel, LanguagePreference, LearningLevel } from '../../shared/types';

export interface IAskQuestionInput {
  question: string;
  language?: LanguagePreference;
  level?: LearningLevel;
  sessionId?: string;
}

export interface IAITutorResponse {
  questionId: string;
  explanation: string;
  hindiExplanation?: string;
  examples: string[];
  followUpQuestions: string[];
  summary: string;
  subject: string;
  topic: string;
  detectedLanguage: string;
  processingMs: number;
}

export interface IQuestionRecord extends IBaseModel {
  studentId: string;
  rawText: string;
  detectedLanguage: string;
  subject?: string;
  topic?: string;
  status: 'PENDING' | 'PROCESSING' | 'ANSWERED' | 'FAILED';
}
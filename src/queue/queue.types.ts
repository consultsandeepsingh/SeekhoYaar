export interface AIJobPayload {
  questionId: string;
  studentId: string;
  rawText: string;
  preferredLanguage: string;
  learningLevel: string;
}

export type JobType = 'AI_PROCESS_QUESTION' | 'GENERATE_ANALYTICS' | 'SEND_NOTIFICATION';

export interface IQueueProducer {
  publish(jobType: JobType, payload: AIJobPayload): Promise<void>;
}

export interface IQueueConsumer {
  subscribe(jobType: JobType, handler: (payload: AIJobPayload) => Promise<void>): Promise<void>;
}
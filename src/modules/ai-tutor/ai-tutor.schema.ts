import { z } from 'zod';

export const askQuestionSchema = z.object({
  question: z
    .string()
    .min(5, 'Question too short')
    .max(1000, 'Question too long'),
  language: z.enum(['english', 'hinglish', 'hindi']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  sessionId: z.string().uuid().optional(),
});

export const feedbackSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;
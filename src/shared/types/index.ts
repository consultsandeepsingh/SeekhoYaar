export interface IPagination {
  page: number;
  limit: number;
  offset: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SortOrder = 'asc' | 'desc';

export interface IBaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LanguagePreference = 'english' | 'hinglish' | 'hindi';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserRole = 'student' | 'admin';
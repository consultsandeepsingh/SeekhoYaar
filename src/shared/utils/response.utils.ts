import { IPaginatedResult } from '../types';

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  requestId?: string;
}

interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ResponseUtils {
  static success<T>(data: T, message = 'Success', requestId?: string): SuccessResponse<T> {
    return { success: true, message, data, requestId };
  }

  static paginated<T>(
    result: IPaginatedResult<T>,
    message = 'Success'
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
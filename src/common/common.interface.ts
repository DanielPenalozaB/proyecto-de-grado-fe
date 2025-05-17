/**
 * Response with data and pagination metadata
 * @template T
 */
export interface ApiResponse<T> {
  data: T[];
  meta?: {
    pagination: {
      page: number;
      limit: number;
      pageCount: number;
      total: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

/**
 * Response for basic message responses
 */
export interface MessageResponse {
  message: string;
}

/**
 * Response with data and message
 */
export interface DataResponse<T> {
  message: string;
  data: T;
}

export enum Languages {
  EN = 'en',
  ES = 'es'
}
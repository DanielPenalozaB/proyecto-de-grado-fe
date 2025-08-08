/**
 * Response with data and pagination metadata
 * @template T
 */
export interface ApiResponse<T> {
  success: boolean,
  message: string,
  data: T[];
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
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
  success: boolean,
  message: string,
  data: T;
}

export enum Languages {
  EN = 'en',
  ES = 'es'
}
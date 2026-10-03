export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  details?: Array<{
    field?: string;
    rejectedValue?: unknown;
    message: string;
  }>;
}

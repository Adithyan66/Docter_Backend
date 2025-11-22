import { HttpResponse } from '../../presentation/interfaces/http-response.interface';
import { HttpStatus } from './status-codes';

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  timestamp?: string;
}

export const successResponse = <T>(
  res: HttpResponse,
  data: T,
  statusCode: number = HttpStatus.OK,
  message?: string
): HttpResponse => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: HttpResponse,
  code: string,
  message: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
): HttpResponse => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

export const paginatedResponse = <T>(
  res: HttpResponse,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): HttpResponse => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  };

  if (message) {
    response.message = message;
  }

  return res.status(HttpStatus.OK).json(response);
};

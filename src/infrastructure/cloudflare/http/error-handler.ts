import { DomainError } from '../../../domain/errors/base.error';
import { HttpRequest, HttpResponse, HttpNext, HttpErrorHandler } from '../../../presentation/interfaces';
import { HttpStatus, ErrorCodes, ServerErrors, errorResponse } from '../../constants';
import { config } from '../../config';

const logError = (error: Error, req: HttpRequest, code: string, statusCode: number): void => {
  console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
  console.error(`  Code: ${code}  Status: ${statusCode}  ${req.method} ${req.path}`);
  if (config.nodeEnv !== 'production' && error.stack) {
    console.error(`  Stack: ${error.stack}`);
  }
};

export const workerErrorHandler: HttpErrorHandler = (
  err: Error,
  req: HttpRequest,
  res: HttpResponse,
  _next?: HttpNext
): void => {
  if (err instanceof DomainError) {
    logError(err, req, err.code, err.statusCode);
    errorResponse(res, err.code, err.message, err.statusCode);
    return;
  }

  logError(err, req, ErrorCodes.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
  errorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR, ServerErrors.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
};

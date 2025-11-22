import { Error as MongooseError } from 'mongoose';
import { DomainError } from '../../domain/errors/base.error';
import { HttpRequest, HttpResponse, HttpNext, HttpErrorHandler } from '../../presentation/interfaces';
import { HttpStatus, ErrorCodes, ServerErrors, errorResponse } from '../constants';
import { handleMongooseError } from './mongoose-error-handler';
import { handleExpressError } from './express-error-handler';
import { config } from '../config';

const logError = (error: Error, req: HttpRequest, code: string, statusCode: number): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;

  console.error(`[${timestamp}] Error: ${error.message}`);
  console.error(`  Code: ${code}`);
  console.error(`  Status: ${statusCode}`);
  console.error(`  Method: ${method}`);
  console.error(`  Path: ${path}`);

  if (config.nodeEnv === 'development' && error.stack) {
    console.error(`  Stack: ${error.stack}`);
  }
};

export const errorHandler: HttpErrorHandler = (
  err: Error,
  req: HttpRequest,
  res: HttpResponse,
  next?: HttpNext
): void => {
  let error = err;
  let code: string = ErrorCodes.INTERNAL_SERVER_ERROR;
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string = ServerErrors.INTERNAL_SERVER_ERROR;

  if (err instanceof DomainError) {
    code = err.code;
    statusCode = err.statusCode;
    message = err.message;
    logError(err, req, code, statusCode);
    errorResponse(res, code, message, statusCode);
    return;
  }

  if (err instanceof MongooseError || err.name?.includes('Mongo')) {
    error = handleMongooseError(err);
    if (error instanceof DomainError) {
      code = error.code;
      statusCode = error.statusCode;
      message = error.message;
      logError(error, req, code, statusCode);
      errorResponse(res, code, message, statusCode);
      return;
    }
  }

  if (err.name === 'SyntaxError' || err.name === 'MulterError') {
    error = handleExpressError(err);
    if (error instanceof DomainError) {
      code = error.code;
      statusCode = error.statusCode;
      message = error.message;
      logError(error, req, code, statusCode);
      errorResponse(res, code, message, statusCode);
      return;
    }
  }

  logError(error, req, code, statusCode);

  errorResponse(res, code, message, statusCode);
};

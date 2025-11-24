import { DomainError } from './base.error';
import { ErrorCodes, HttpStatus } from '../../infrastructure/constants';

export class BadRequestError extends DomainError {
  readonly code = ErrorCodes.BAD_REQUEST;
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}


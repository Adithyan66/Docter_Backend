import { DomainError } from './base.error';
import { ErrorCodes, HttpStatus } from '../../infrastructure/constants';

export class ValidationError extends DomainError {
  readonly code = ErrorCodes.VALIDATION_ERROR;
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}

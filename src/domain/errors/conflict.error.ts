import { DomainError } from './base.error';
import { ErrorCodes, HttpStatus } from '../../infrastructure/constants';

export class ConflictError extends DomainError {
  readonly code = ErrorCodes.CONFLICT;
  readonly statusCode = HttpStatus.CONFLICT;

  constructor(message: string) {
    super(message);
  }
}

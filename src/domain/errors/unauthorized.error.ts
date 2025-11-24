import { DomainError } from './base.error';
import { ErrorCodes, HttpStatus } from '../../infrastructure/constants';

export class UnauthorizedError extends DomainError {
  readonly code = ErrorCodes.UNAUTHORIZED;
  readonly statusCode = HttpStatus.UNAUTHORIZED;

  constructor(message: string) {
    super(message);
  }
}

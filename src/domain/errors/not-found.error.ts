import { DomainError } from './base.error';
import { ErrorCodes, HttpStatus, NotFoundErrors } from '../../infrastructure/constants';

export class NotFoundError extends DomainError {
  readonly code = ErrorCodes.NOT_FOUND;
  readonly statusCode = HttpStatus.NOT_FOUND;

  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier ${identifier} not found`
        : NotFoundErrors.RECORD_NOT_FOUND(resource)
    );
  }
}

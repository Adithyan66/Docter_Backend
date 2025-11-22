import { ValidationError } from '../../domain/errors/validation.error';
import { ValidationErrors } from '../constants';

export const handleExpressError = (error: Error): Error => {
  if (error.name === 'SyntaxError' && 'body' in error) {
    return new ValidationError(ValidationErrors.INVALID_INPUT);
  }

  if (error.name === 'MulterError') {
    return new ValidationError('File upload error');
  }

  return error;
};

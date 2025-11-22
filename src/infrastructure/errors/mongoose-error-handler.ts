import { Error as MongooseError } from 'mongoose';
import { ValidationError } from '../../domain/errors/validation.error';
import { ConflictError } from '../../domain/errors/conflict.error';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ErrorCodes, HttpStatus, ValidationErrors, ConflictErrors, NotFoundErrors } from '../constants';

export const handleMongooseError = (error: MongooseError): Error => {
  if (error.name === 'ValidationError') {
    const validationError = error as MongooseError.ValidationError;
    const messages = Object.values(validationError.errors).map((err) => err.message);
    return new ValidationError(messages.join(', ') || ValidationErrors.INVALID_INPUT);
  }

  if (error.name === 'CastError') {
    const castError = error as MongooseError.CastError;
    return new ValidationError(
      `Invalid ${castError.kind} value for field ${castError.path}: ${castError.value}`
    );
  }

  if (error.name === 'MongoServerError') {
    const mongoError = error as any;
    
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
      const value = mongoError.keyValue?.[field] || '';
      return new ConflictError(
        field === 'email' 
          ? ConflictErrors.EMAIL_ALREADY_EXISTS
          : `${field} with value ${value} already exists`
      );
    }

    if (mongoError.code === 11001) {
      return new ConflictError(ConflictErrors.DUPLICATE_ENTRY);
    }
  }

  if (error.name === 'DocumentNotFoundError') {
    return new NotFoundError('Document', '');
  }

  return error;
};

import { ZodSchema, ZodError } from 'zod';
import { HttpRequest, HttpResponse, HttpNext, HttpHandler } from '../interfaces';
import { ValidationError } from '../../domain/errors/validation.error';

export const validate = (schema: ZodSchema): HttpHandler => {
  return (req: HttpRequest, _res: HttpResponse, next?: HttpNext): void => {
    try {
      if (req.body === undefined || req.body === null) {
        if (next) {
          next(new ValidationError('Request body is required'));
        }
        return;
      }
      schema.parse(req.body);
      if (next) {
        next(); 
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => issue.message).join(', ');
        if (next) {
          next(new ValidationError(message));
        }
        return;
      }
      if (next && error instanceof Error) {
        next(error);
      }
    }
  };
};

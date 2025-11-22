import { HttpRequest, HttpResponse, HttpNext, HttpHandler } from '../interfaces';

export const asyncHandler = (fn: HttpHandler): HttpHandler => {
  return (req: HttpRequest, res: HttpResponse, next?: HttpNext): void => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (next && error instanceof Error) {
        next(error);
      }
    });
  };
};


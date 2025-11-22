import { HttpRequest } from './http-request.interface';
import { HttpResponse } from './http-response.interface';

export type HttpNext = (error?: Error) => void;

export type HttpHandler = (
  req: HttpRequest,
  res: HttpResponse,
  next?: HttpNext
) => Promise<void> | void;

export type HttpErrorHandler = (
  error: Error,
  req: HttpRequest,
  res: HttpResponse,
  next?: HttpNext
) => Promise<void> | void;

import { HttpHandler, HttpErrorHandler } from './http-handler.interface';

export interface Router {
  get(path: string, ...handlers: HttpHandler[]): void;
  post(path: string, ...handlers: HttpHandler[]): void;
  put(path: string, ...handlers: HttpHandler[]): void;
  patch(path: string, ...handlers: HttpHandler[]): void;
  delete(path: string, ...handlers: HttpHandler[]): void;
  use(...handlers: (HttpHandler | HttpErrorHandler)[]): void;
  route(path: string): Router;
}

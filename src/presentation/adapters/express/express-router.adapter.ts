import { Router as ExpressRouter } from 'express';
import { Router } from '../../interfaces/router.interface';
import { HttpHandler, HttpErrorHandler } from '../../interfaces/http-handler.interface';
import { ExpressRequestAdapter } from './express-request.adapter';
import { ExpressResponseAdapter } from './express-response.adapter';
import { Request, Response, NextFunction } from 'express';

export class ExpressRouterAdapter implements Router {
  constructor(private readonly expressRouter: ExpressRouter) {}

  private adaptHandler(handler: HttpHandler | HttpErrorHandler): any {
    return (req: Request, res: Response, next: NextFunction) => {
      const adaptedReq = new ExpressRequestAdapter(req);
      const adaptedRes = new ExpressResponseAdapter(res);
      
      if (handler.length === 4) {
        const errorHandler = handler as HttpErrorHandler;
        const error = (req as any).error || new Error('Unknown error');
        return errorHandler(error, adaptedReq, adaptedRes, next);
      }
      
      const httpHandler = handler as HttpHandler;
      try {
        const result = httpHandler(adaptedReq, adaptedRes, next);
        
        if (result instanceof Promise) {
          result.catch((err) => {
            if (next) {
              next(err);
            }
          });
        }
      } catch (err) {
        if (next) {
          next(err as Error);
        }
      }
    };
  }

  get(path: string, ...handlers: HttpHandler[]): void {
    this.expressRouter.get(path, ...handlers.map((h) => this.adaptHandler(h)));
  }

  post(path: string, ...handlers: HttpHandler[]): void {
    this.expressRouter.post(path, ...handlers.map((h) => this.adaptHandler(h)));
  }

  put(path: string, ...handlers: HttpHandler[]): void {
    this.expressRouter.put(path, ...handlers.map((h) => this.adaptHandler(h)));
  }

  patch(path: string, ...handlers: HttpHandler[]): void {
    this.expressRouter.patch(path, ...handlers.map((h) => this.adaptHandler(h)));
  }

  delete(path: string, ...handlers: HttpHandler[]): void {
    this.expressRouter.delete(path, ...handlers.map((h) => this.adaptHandler(h)));
  }

  use(...handlers: (HttpHandler | HttpErrorHandler)[]): void {
    this.expressRouter.use(...handlers.map((h) => this.adaptHandler(h)));
  }

  route(path: string): Router {
    const expressRoute = this.expressRouter.route(path);
    return new ExpressRouterAdapter(expressRoute as any);
  }
}

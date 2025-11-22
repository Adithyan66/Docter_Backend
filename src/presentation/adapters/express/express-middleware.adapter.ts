import { Request, Response, NextFunction } from 'express';
import { HttpHandler, HttpErrorHandler } from '../../interfaces/http-handler.interface';
import { ExpressRequestAdapter } from './express-request.adapter';
import { ExpressResponseAdapter } from './express-response.adapter';

export const adaptMiddleware = (handler: HttpHandler | HttpErrorHandler) => {
  if (handler.length === 4) {
    const errorHandler = handler as HttpErrorHandler;
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      const adaptedReq = new ExpressRequestAdapter(req);
      const adaptedRes = new ExpressResponseAdapter(res);
      const result = errorHandler(err, adaptedReq, adaptedRes, next);
      
      if (result instanceof Promise) {
        result.catch((error) => {
          if (next) {
            next(error);
          }
        });
      }
    };
  }
  
  const httpHandler = handler as HttpHandler;
  return (req: Request, res: Response, next: NextFunction) => {
    const adaptedReq = new ExpressRequestAdapter(req);
    const adaptedRes = new ExpressResponseAdapter(res);
    const result = httpHandler(adaptedReq, adaptedRes, next);
    
    if (result instanceof Promise) {
      result.catch((err) => next(err));
    }
  };
};

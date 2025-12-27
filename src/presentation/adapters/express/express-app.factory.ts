import express, { Express as ExpressApp, Router as ExpressRouter } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config as appConfig } from '../../../infrastructure/config';
import { ExpressRouterAdapter } from './express-router.adapter';
import { Router } from '../../interfaces/router.interface';
import { adaptMiddleware } from './express-middleware.adapter';
import { HttpErrorHandler, HttpHandler } from '../../interfaces/http-handler.interface';

export interface AppConfig {
  routes?: (router: Router) => void;
  errorHandler?: HttpErrorHandler;
  notFoundHandler?: HttpHandler;
}

export const createExpressApp = (config: AppConfig): ExpressApp => {
  
  const app = express();

  app.use(cors({ origin: appConfig.corsOrigin || '*', credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid JSON in request body'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(err);
  });
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (config.routes) {
    const expressRouter = express.Router();
    const router = new ExpressRouterAdapter(expressRouter);
    config.routes(router);
    app.use('/api', expressRouter);
  }

  if (config.notFoundHandler) {
    app.use(adaptMiddleware(config.notFoundHandler));
  }

  if (config.errorHandler) {
    app.use(adaptMiddleware(config.errorHandler));
  }

  return app;
};

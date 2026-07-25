import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { Router } from '../../interfaces/router.interface';
import { HttpHandler, HttpErrorHandler } from '../../interfaces/http-handler.interface';
import { Env } from '../../../infrastructure/cloudflare/env';
import { HonoRequestAdapter } from './hono-request.adapter';
import { HonoResponseAdapter } from './hono-response.adapter';
import { HonoRouterAdapter } from './hono-router.adapter';

export interface HonoAppConfig {
  routes?: (router: Router) => void;
  errorHandler?: HttpErrorHandler;
  notFoundHandler?: HttpHandler;
}

type App = Hono<{ Bindings: Env }>;

const runNotFound = async (c: Context, handler: HttpHandler): Promise<Response> => {
  const req = new HonoRequestAdapter(c, undefined);
  const res = new HonoResponseAdapter();
  await handler(req, res);
  return res.toResponse();
};

const runError = async (
  c: Context,
  err: Error,
  handler: HttpErrorHandler
): Promise<Response> => {
  const req = new HonoRequestAdapter(c, undefined);
  const res = new HonoResponseAdapter();
  await handler(err, req, res);
  return res.toResponse();
};

export const createHonoApp = (config: HonoAppConfig): App => {
  const app = new Hono<{ Bindings: Env }>();

  app.use(
    '*',
    cors({
      origin: (origin, c) => c.env.CORS_ORIGIN || origin || '*',
      credentials: true,
    })
  );

  app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

  if (config.routes) {
    const api = new Hono<{ Bindings: Env }>();
    const router = new HonoRouterAdapter(api, config.errorHandler);
    config.routes(router);
    app.route('/api', api);
  }

  if (config.notFoundHandler) {
    const notFoundHandler = config.notFoundHandler;
    app.notFound((c) => runNotFound(c, notFoundHandler));
  }

  if (config.errorHandler) {
    const errorHandler = config.errorHandler;
    app.onError((err, c) => runError(c, err, errorHandler));
  }

  return app;
};

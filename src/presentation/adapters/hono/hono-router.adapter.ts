import type { Context, Hono } from 'hono';
import { Router } from '../../interfaces/router.interface';
import { HttpHandler, HttpErrorHandler } from '../../interfaces/http-handler.interface';
import { HonoRequestAdapter } from './hono-request.adapter';
import { HonoResponseAdapter } from './hono-response.adapter';

type HonoApp = Hono<{ Bindings: any }>;
type Outcome = 'advance' | 'done';

const runHandler = (
  handler: HttpHandler | HttpErrorHandler,
  req: HonoRequestAdapter,
  res: HonoResponseAdapter
): Promise<Outcome> =>
  new Promise<Outcome>((resolve, reject) => {
    let settled = false;
    const settle = (v: Outcome): void => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    const fail = (e: unknown): void => {
      if (!settled) {
        settled = true;
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };

    const next = (err?: Error): void => (err ? fail(err) : settle('advance'));

    // A handler that responds (res.json/send) finishes the chain even though it
    // never calls next() — asyncHandler resolves its inner promise asynchronously.
    res.onFinish = () => settle('done');

    try {
      const result = (handler as HttpHandler)(req, res, next);
      if (result && typeof (result as Promise<void>).then === 'function') {
        (result as Promise<void>).then(() => undefined, fail);
      }
    } catch (e) {
      fail(e);
    }
  });

const parseBody = async (
  c: Context
): Promise<{ body: unknown; invalidJson: boolean }> => {
  const method = c.req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') return { body: undefined, invalidJson: false };

  const contentType = c.req.header('content-type') || '';

  if (contentType.includes('application/json')) {
    const raw = await c.req.text();
    if (raw.trim() === '') return { body: undefined, invalidJson: false };
    try {
      return { body: JSON.parse(raw), invalidJson: false };
    } catch {
      return { body: undefined, invalidJson: true };
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await c.req.parseBody();
    return { body: form, invalidJson: false };
  }

  return { body: undefined, invalidJson: false };
};

const invalidJsonResponse = (): Response =>
  new Response(
    JSON.stringify({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON in request body' },
      timestamp: new Date().toISOString(),
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );

export class HonoRouterAdapter implements Router {
  constructor(
    private readonly app: HonoApp,
    private readonly errorHandler?: HttpErrorHandler,
    private readonly globalMiddleware: HttpHandler[] = []
  ) {}

  private register(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    handlers: HttpHandler[]
  ): void {
    const chain = [...this.globalMiddleware, ...handlers];
    const errorHandler = this.errorHandler;

    this.app[method](path, async (c: Context) => {
      const { body, invalidJson } = await parseBody(c);
      if (invalidJson) return invalidJsonResponse();

      const req = new HonoRequestAdapter(c, body);
      const res = new HonoResponseAdapter();

      try {
        for (const handler of chain) {
          const outcome = await runHandler(handler, req, res);
          if (outcome === 'done') break;
        }
      } catch (err) {
        if (errorHandler) {
          await errorHandler(err as Error, req, res);
        } else {
          throw err;
        }
      }

      if (!res.finished && errorHandler) {
        await errorHandler(new Error('No response produced by route handlers'), req, res);
      }

      return res.toResponse();
    });
  }

  get(path: string, ...handlers: HttpHandler[]): void {
    this.register('get', path, handlers);
  }

  post(path: string, ...handlers: HttpHandler[]): void {
    this.register('post', path, handlers);
  }

  put(path: string, ...handlers: HttpHandler[]): void {
    this.register('put', path, handlers);
  }

  patch(path: string, ...handlers: HttpHandler[]): void {
    this.register('patch', path, handlers);
  }

  delete(path: string, ...handlers: HttpHandler[]): void {
    this.register('delete', path, handlers);
  }

  use(...handlers: (HttpHandler | HttpErrorHandler)[]): void {
    for (const h of handlers) {
      if (h.length === 4) continue; // error handlers are wired at the app level
      this.globalMiddleware.push(h as HttpHandler);
    }
  }

  route(path: string): Router {
    const basePath = this.app.basePath(path) as unknown as HonoApp;
    return new HonoRouterAdapter(basePath, this.errorHandler, [...this.globalMiddleware]);
  }
}

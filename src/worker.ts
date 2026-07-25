import 'reflect-metadata';
import type { Env } from './infrastructure/cloudflare/env';
import { buildRequestContainer } from './di/worker-container';
import { createHonoApp } from './presentation/adapters/hono/hono-app.factory';
import { setupRoutes } from './presentation/routes';
import { workerErrorHandler } from './infrastructure/cloudflare/http/error-handler';
import { notFoundHandler } from './infrastructure/errors/not-found-handler';
import { D1BackupService } from './infrastructure/cloudflare/services/d1-backup.service';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const scope = buildRequestContainer(env);
    const app = createHonoApp({
      routes: (router) => setupRoutes(router, scope),
      errorHandler: workerErrorHandler,
      notFoundHandler,
    });
    return app.fetch(request, env, ctx);
  },

  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const scope = buildRequestContainer(env);
    const backup = scope.resolve(D1BackupService);
    ctx.waitUntil(
      backup
        .run(new Date())
        .then((r) => console.log(`[Backup] ok key=${r.key} tables=${r.tableCount} rows=${r.rowCount} bytes=${r.bytes}`))
        .catch((e) => console.error('[Backup] failed', e))
    );
  },
} satisfies ExportedHandler<Env>;

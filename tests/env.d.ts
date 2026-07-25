import type { Env } from '../src/infrastructure/cloudflare/env';

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: unknown[];
  }
}

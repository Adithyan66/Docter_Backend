import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/infrastructure/cloudflare/db/schema/index.ts',
  out: './drizzle/migrations',
});

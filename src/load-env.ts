import dotenv from 'dotenv';

// Node-only: populate process.env from a local .env file. On Cloudflare Workers
// process.env is populated by the runtime (nodejs_compat_populate_process_env),
// and this module is never imported by the Worker entry.
dotenv.config();

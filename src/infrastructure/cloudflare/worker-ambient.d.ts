// Ambient declarations for the Workers typecheck (no @types/node here).
// At runtime: process.env is populated by nodejs_compat_populate_process_env,
// and Error.captureStackTrace exists on the V8-based Workers runtime.

declare const process: { env: Record<string, string | undefined> };

interface ErrorConstructor {
  // eslint-disable-next-line @typescript-eslint/ban-types
  captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}

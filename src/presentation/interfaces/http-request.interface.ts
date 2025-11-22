export interface HttpRequest {
  body: unknown;
  query: Record<string, unknown>;
  params: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  method: string;
  path: string;
  url: string;
  ip?: string;
  protocol?: string;
  user?: unknown;
  get(header: string): string | undefined;
}

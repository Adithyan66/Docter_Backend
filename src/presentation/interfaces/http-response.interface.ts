export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
}

export interface HttpResponse {
  status(code: number): HttpResponse;
  json(data: unknown): HttpResponse;
  send(data: unknown): HttpResponse;
  header(name: string, value: string): HttpResponse;
  setHeader(name: string, value: string): HttpResponse;
  cookie(name: string, value: string, options?: CookieOptions): HttpResponse;
  clearCookie(name: string, options?: CookieOptions): HttpResponse;
}

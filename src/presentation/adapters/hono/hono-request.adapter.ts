import type { Context } from 'hono';
import { HttpRequest } from '../../interfaces/http-request.interface';
import { parseCookies } from './cookie.util';

export class HonoRequestAdapter implements HttpRequest {
  private _user: unknown = undefined;
  private readonly _cookies: Record<string, string>;
  private readonly _headers: Record<string, string | string[] | undefined>;
  private readonly _url: URL;

  constructor(
    private readonly c: Context,
    private readonly parsedBody: unknown
  ) {
    this._url = new URL(c.req.url);
    this._headers = {};
    c.req.raw.headers.forEach((value, key) => {
      this._headers[key] = value;
    });
    this._cookies = parseCookies(c.req.header('cookie'));
  }

  get body(): unknown {
    return this.parsedBody;
  }

  get query(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of this._url.searchParams.keys()) {
      if (key in out) continue;
      const all = this._url.searchParams.getAll(key);
      out[key] = all.length > 1 ? all : all[0];
    }
    return out;
  }

  get params(): Record<string, string> {
    return this.c.req.param() as Record<string, string>;
  }

  get headers(): Record<string, string | string[] | undefined> {
    return this._headers;
  }

  get method(): string {
    return this.c.req.method;
  }

  get path(): string {
    return this._url.pathname;
  }

  get url(): string {
    return this._url.pathname + this._url.search;
  }

  get ip(): string | undefined {
    return this.c.req.header('cf-connecting-ip') || undefined;
  }

  get protocol(): string | undefined {
    return this.c.req.header('x-forwarded-proto') || this._url.protocol.replace(':', '');
  }

  get user(): unknown {
    return this._user;
  }

  set user(value: unknown) {
    this._user = value;
  }

  get cookies(): Record<string, string> | undefined {
    return this._cookies;
  }

  get(header: string): string | undefined {
    return this.c.req.header(header) || undefined;
  }
}

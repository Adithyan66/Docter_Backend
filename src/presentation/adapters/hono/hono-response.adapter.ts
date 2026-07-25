import { HttpResponse, CookieOptions } from '../../interfaces/http-response.interface';
import { serializeCookie } from './cookie.util';

/**
 * Accumulates status/headers/cookies/body imperatively (Express-style) so
 * existing controllers keep calling `res.status().json()`. The router materializes
 * a Web `Response` from this state after the handler chain finishes.
 */
export class HonoResponseAdapter implements HttpResponse {
  private statusCode = 200;
  private readonly outHeaders = new Headers();
  private readonly setCookies: string[] = [];
  private bodyContent: string | null = null;
  private _finished = false;

  onFinish: (() => void) | null = null;

  get finished(): boolean {
    return this._finished;
  }

  private markFinished(): void {
    if (this._finished) return;
    this._finished = true;
    this.onFinish?.();
  }

  status(code: number): HttpResponse {
    this.statusCode = code;
    return this;
  }

  json(data: unknown): HttpResponse {
    this.outHeaders.set('Content-Type', 'application/json');
    this.bodyContent = JSON.stringify(data);
    this.markFinished();
    return this;
  }

  send(data: unknown): HttpResponse {
    if (typeof data === 'string') {
      if (!this.outHeaders.has('Content-Type')) {
        this.outHeaders.set('Content-Type', 'text/plain; charset=utf-8');
      }
      this.bodyContent = data;
    } else {
      this.outHeaders.set('Content-Type', 'application/json');
      this.bodyContent = JSON.stringify(data);
    }
    this.markFinished();
    return this;
  }

  header(name: string, value: string): HttpResponse {
    this.outHeaders.set(name, value);
    return this;
  }

  setHeader(name: string, value: string): HttpResponse {
    this.outHeaders.set(name, value);
    return this;
  }

  cookie(name: string, value: string, options?: CookieOptions): HttpResponse {
    this.setCookies.push(serializeCookie(name, value, options));
    return this;
  }

  clearCookie(name: string, options?: CookieOptions): HttpResponse {
    this.setCookies.push(
      serializeCookie(name, '', { ...options, maxAge: 0, expires: new Date(0) })
    );
    return this;
  }

  toResponse(): Response {
    const headers = new Headers(this.outHeaders);
    for (const c of this.setCookies) {
      headers.append('Set-Cookie', c);
    }
    return new Response(this.bodyContent, { status: this.statusCode, headers });
  }
}

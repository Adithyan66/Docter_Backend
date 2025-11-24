import { Request } from 'express';
import { HttpRequest } from '../../interfaces/http-request.interface';

export class ExpressRequestAdapter implements HttpRequest {
  constructor(private readonly expressRequest: Request) {}

  get body(): unknown {
    return this.expressRequest.body;
  }

  get query(): Record<string, unknown> {
    return this.expressRequest.query as Record<string, unknown>;
  }

  get params(): Record<string, string> {
    return this.expressRequest.params;
  }

  get headers(): Record<string, string | string[] | undefined> {
    return this.expressRequest.headers;
  }

  get method(): string {
    return this.expressRequest.method;
  }

  get path(): string {
    return this.expressRequest.path;
  }

  get url(): string {
    return this.expressRequest.url;
  }

  get ip(): string | undefined {
    return this.expressRequest.ip;
  }

  get protocol(): string | undefined {
    return this.expressRequest.protocol;
  }

  get user(): unknown {
    return (this.expressRequest as any).user;
  }

  set user(value: unknown) {
    (this.expressRequest as any).user = value;
  }

  get cookies(): Record<string, string> | undefined {
    return (this.expressRequest as any).cookies;
  }

  get(header: string): string | undefined {
    const value = this.expressRequest.get(header);
    return value || undefined;
  }
}

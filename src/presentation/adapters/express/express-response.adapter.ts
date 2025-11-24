import { Response } from 'express';
import { HttpResponse, CookieOptions } from '../../interfaces/http-response.interface';

export class ExpressResponseAdapter implements HttpResponse {
  constructor(private readonly expressResponse: Response) {}

  status(code: number): HttpResponse {
    this.expressResponse.status(code);
    return this;
  }

  json(data: unknown): HttpResponse {
    this.expressResponse.setHeader('Content-Type', 'application/json');
    this.expressResponse.json(data);
    return this;
  }

  send(data: unknown): HttpResponse {
    this.expressResponse.send(data);
    return this;
  }

  header(name: string, value: string): HttpResponse {
    this.expressResponse.header(name, value);
    return this;
  }

  setHeader(name: string, value: string): HttpResponse {
    this.expressResponse.setHeader(name, value);
    return this;
  }

  cookie(name: string, value: string, options?: CookieOptions): HttpResponse {
    if (options) {
      this.expressResponse.cookie(name, value, options);
    } else {
      this.expressResponse.cookie(name, value);
    }
    return this;
  }

  clearCookie(name: string, options?: CookieOptions): HttpResponse {
    if (options) {
      this.expressResponse.clearCookie(name, options);
    } else {
      this.expressResponse.clearCookie(name);
    }
    return this;
  }
}

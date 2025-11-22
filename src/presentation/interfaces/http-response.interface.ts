export interface HttpResponse {
  status(code: number): HttpResponse;
  json(data: unknown): HttpResponse;
  send(data: unknown): HttpResponse;
  header(name: string, value: string): HttpResponse;
  setHeader(name: string, value: string): HttpResponse;
}

import { HttpRequest } from '../http-request.interface';
import { HttpResponse } from '../http-response.interface';
import { HttpNext } from '../http-handler.interface';

export interface IPaymentController {
  create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  refund(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}

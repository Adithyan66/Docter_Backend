import { HttpRequest } from '../http-request.interface';
import { HttpResponse } from '../http-response.interface';
import { HttpNext } from '../http-handler.interface';

export interface ITreatmentCourseController {
  create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}

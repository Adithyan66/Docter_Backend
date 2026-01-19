import { HttpRequest } from '../http-request.interface';
import { HttpResponse } from '../http-response.interface';
import { HttpNext } from '../http-handler.interface';

export interface ICalendarEntryController {
  create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  addAppointment(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  updateAppointment(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  deleteAppointment(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  toggleAppointmentCompleted(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getAppointments(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getMonthly(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  getByDate(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}


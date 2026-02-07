import { HttpRequest, HttpResponse, HttpNext } from '../http-handler.interface';

export interface IAnalyticsController {
  getDashboard(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}



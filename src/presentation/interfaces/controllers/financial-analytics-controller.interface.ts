import { HttpRequest, HttpResponse, HttpNext } from '../http-handler.interface';

export interface IFinancialAnalyticsController {
  getDashboard(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}


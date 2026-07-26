import { HttpRequest } from '../http-request.interface';
import { HttpResponse } from '../http-response.interface';
import { HttpNext } from '../http-handler.interface';

export interface IAnalyticsController {
  getDashboard(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}

import { HttpRequest } from '../http-request.interface';
import { HttpResponse } from '../http-response.interface';
import { HttpNext } from '../http-handler.interface';

export interface IAuthController {
  login(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  refreshToken(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  logout(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}

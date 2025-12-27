import { HttpRequest } from '../http-request.interface';
import { HttpResponse } from '../http-response.interface';
import { HttpNext } from '../http-handler.interface';

export interface IImageServiceController {
  generateUploadUrl(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
  generateDownloadUrl(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void>;
}

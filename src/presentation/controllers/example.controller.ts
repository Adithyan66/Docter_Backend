import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';

export class ExampleController {
  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    successResponse(res, req.body, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async findAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    successResponse(res, [], HttpStatus.OK, SuccessMessages.RETRIEVED);
  }
}

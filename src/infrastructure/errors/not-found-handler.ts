import { HttpRequest, HttpResponse, HttpHandler } from '../../presentation/interfaces';
import { HttpStatus, ErrorCodes, NotFoundErrors, errorResponse } from '../constants';

export const notFoundHandler: HttpHandler = (req: HttpRequest, res: HttpResponse): void => {
  errorResponse(
    res,
    ErrorCodes.NOT_FOUND,
    NotFoundErrors.ROUTE_NOT_FOUND(req.method, req.path),
    HttpStatus.NOT_FOUND
  );
};

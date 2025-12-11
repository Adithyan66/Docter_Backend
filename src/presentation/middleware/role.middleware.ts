import { HttpHandler, HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { AuthenticationErrors } from '../../infrastructure/constants/error-messages';
import { JwtPayload } from '../../application/interfaces/jwt-service.interface';

export const requireRole = (roles: Array<'doctor' | 'staff'>): HttpHandler => {
  return (req: HttpRequest, res: HttpResponse, next?: HttpNext): void => {
    const user = req.user as JwtPayload | undefined;
    if (!user || !user.role || !roles.includes(user.role)) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    if (next) {
      next();
    }
  };
};

export const doctorOnly = requireRole(['doctor']);

export const requireClinicAccess = (paramName: string): HttpHandler => {
  return (req: HttpRequest, res: HttpResponse, next?: HttpNext): void => {
    const user = req.user as JwtPayload | undefined;
    if (!user || !user.role) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    if (user.role === 'staff') {
      const clinicParam = req.params[paramName];
      if (!clinicParam || clinicParam !== user.clinicId) {
        throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
      }
    }
    if (next) {
      next();
    }
  };
};



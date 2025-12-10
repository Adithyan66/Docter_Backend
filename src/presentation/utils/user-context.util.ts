import { HttpRequest } from '../interfaces/http-request.interface';
import { JwtPayload } from '../../application/interfaces/jwt-service.interface';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { AuthenticationErrors } from '../../infrastructure/constants/error-messages';

export interface UserContext {
  id: string;
  role: 'doctor' | 'staff';
  clinicId?: string;
  doctorId: string;
  email: string;
}

export const getUserContext = (req: HttpRequest): UserContext => {
  const user = req.user as JwtPayload | undefined;
  
  if (!user || !user.id || !user.role) {
    throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
  }

  if (user.role === 'staff') {
    if (!user.doctorId) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    return {
      id: user.id,
      role: user.role,
      clinicId: user.clinicId,
      doctorId: user.doctorId,
      email: user.email,
    };
  }

  return {
    id: user.id,
    role: user.role,
    clinicId: undefined,
    doctorId: user.id,
    email: user.email,
  };
};

export const getUserId = (req: HttpRequest): string => {
  const context = getUserContext(req);
  return context.doctorId;
};

export const getClinicId = (req: HttpRequest): string | undefined => {
  const context = getUserContext(req);
  return context.clinicId;
};


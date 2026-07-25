import { injectable, inject, DependencyContainer } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext, HttpHandler } from '../interfaces';
import { JwtPayload, IJwtService } from '../../application/interfaces/jwt-service.interface';
import { AuthenticationErrors } from '../../infrastructure/constants/error-messages';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';

@injectable()
export class AuthMiddleware {
  constructor(
    @inject('IJwtService') private readonly jwtService: IJwtService
  ) {}

  handle(): HttpHandler {
    return async (req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> => {
      try {
        let token: string | undefined;
        
        if (req.cookies && req.cookies.accessToken) {
          token = req.cookies.accessToken;
        } else {
          const authHeader = req.get('Authorization');
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
          }
        }
        
        if (!token) {
          throw new UnauthorizedError(AuthenticationErrors.TOKEN_MISSING);
        }
        
        let payload: JwtPayload;
        try {
          payload = await this.jwtService.verify(token);
        } catch (error) {
          throw new UnauthorizedError(AuthenticationErrors.TOKEN_INVALID);
        }
        
        (req as any).user = payload;
        
        if (next) {
          next();
        }
      } catch (error) {
        if (next) {
          next(error instanceof Error ? error : new Error(String(error)));
        } else {
          throw error;
        }
      }
    };
  }
}

export const authMiddleware = (resolver: DependencyContainer): HttpHandler => {
  const authMiddlewareInstance = resolver.resolve(AuthMiddleware);
  return authMiddlewareInstance.handle();
};


import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IAuthController } from '../interfaces/controllers/auth-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { config } from '../../infrastructure/config';

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('LoginUseCase') private readonly loginUseCase: LoginUseCase,
    @inject('RefreshTokenUseCase') private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject('LogoutUseCase') private readonly logoutUseCase: LogoutUseCase
  ) {}

  async login(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {

    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const { email, password, role, username } = req.body as { email?: string; password: string; role?: 'doctor' | 'staff'; username?: string };
    const result = await this.loginUseCase.execute({ role, email, username, password });
    
    const isProduction = config.nodeEnv === 'production';
    
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });
    
    successResponse(res, result, HttpStatus.OK, SuccessMessages.LOGIN_SUCCESS);
  }

  async refreshToken(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {

    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const { refreshToken } = req.body as { refreshToken: string };
    
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }
    
    const result = await this.refreshTokenUseCase.execute(refreshToken);
    
    const isProduction = config.nodeEnv === 'production';
    
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });
    
    successResponse(res, result, HttpStatus.OK);
  }

  async logout(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const { refreshToken } = req.body as { refreshToken: string };
    
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }
    
    await this.logoutUseCase.execute(refreshToken);
    
    const isProduction = config.nodeEnv === 'production';
    
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    });
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.LOGOUT_SUCCESS);
  }
}

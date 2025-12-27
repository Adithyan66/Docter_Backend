import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IAuthController } from '../interfaces/controllers/auth-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { ILoginUseCase, IRefreshTokenUseCase, ILogoutUseCase } from '../../application/interfaces/use-cases/auth/auth-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { config } from '../../infrastructure/config';

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('ILoginUseCase') private readonly loginUseCase: ILoginUseCase,
    @inject('IRefreshTokenUseCase') private readonly refreshTokenUseCase: IRefreshTokenUseCase,
    @inject('ILogoutUseCase') private readonly logoutUseCase: ILogoutUseCase
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

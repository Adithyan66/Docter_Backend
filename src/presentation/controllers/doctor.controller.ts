import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { container } from '../../di/container';
import { ValidationError } from '../../domain/errors/validation.error';

export class DoctorController {
  private loginUseCase: LoginUseCase;

  constructor() {
    this.loginUseCase = container.resolve(LoginUseCase);
  }

  async login(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const { email, password } = req.body as { email: string; password: string };
    const result = await this.loginUseCase.execute(email, password);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.LOGIN_SUCCESS);
  }
}
 
 
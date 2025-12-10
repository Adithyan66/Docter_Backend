import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateStaffUseCase } from '../../application/use-cases/staff/create-staff.use-case';
import { UpdateStaffUseCase } from '../../application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '../../application/use-cases/staff/delete-staff.use-case';
import { GetStaffUseCase } from '../../application/use-cases/staff/get-staff.use-case';
import { GetAllStaffUseCase } from '../../application/use-cases/staff/get-all-staff.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { JwtPayload } from '../../application/interfaces/jwt-service.interface';
import { AuthenticationErrors } from '../../infrastructure/constants/error-messages';

@injectable()
export class StaffController {
  constructor(
    @inject('CreateStaffUseCase') private readonly createStaffUseCase: CreateStaffUseCase,
    @inject('UpdateStaffUseCase') private readonly updateStaffUseCase: UpdateStaffUseCase,
    @inject('DeleteStaffUseCase') private readonly deleteStaffUseCase: DeleteStaffUseCase,
    @inject('GetStaffUseCase') private readonly getStaffUseCase: GetStaffUseCase,
    @inject('GetAllStaffUseCase') private readonly getAllStaffUseCase: GetAllStaffUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const user = this.getRequestUser(req);
    const result = await this.createStaffUseCase.execute(user.doctorId, req.body as any);
    successResponse(res, result, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Staff ID is required');
    }
    const user = this.getRequestUser(req);
    const result = await this.updateStaffUseCase.execute(id, user.doctorId, req.body as any);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Staff ID is required');
    }
    const user = this.getRequestUser(req);
    await this.deleteStaffUseCase.execute(id, user.doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Staff ID is required');
    }
    const user = this.getRequestUser(req);
    const result = await this.getStaffUseCase.execute(id, user.doctorId);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const user = this.getRequestUser(req);
    const params = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      username: req.query.search ? String(req.query.search) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' || req.query.isActive === '1' : undefined,
    };
    const result = await this.getAllStaffUseCase.execute(user.doctorId, params);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private getRequestUser(req: HttpRequest): { id: string; role: 'doctor' | 'staff'; clinicId?: string; doctorId: string } {
    const user = req.user as JwtPayload | undefined;
    if (!user || !user.id || !user.role) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    if (user.role === 'staff' && !user.doctorId) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    return {
      id: user.id,
      role: user.role,
      clinicId: user.clinicId,
      doctorId: user.role === 'doctor' ? user.id : (user.doctorId as string),
    };
  }
}



import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IStaffController } from '../interfaces/controllers/staff-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateStaffUseCase } from '../../application/use-cases/staff/create-staff.use-case';
import { UpdateStaffUseCase } from '../../application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '../../application/use-cases/staff/delete-staff.use-case';
import { GetStaffUseCase } from '../../application/use-cases/staff/get-staff.use-case';
import { GetAllStaffUseCase } from '../../application/use-cases/staff/get-all-staff.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { getUserContext } from '../utils/user-context.util';

@injectable()
export class StaffController implements IStaffController {
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
    const user = getUserContext(req);
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
    const user = getUserContext(req);
    const result = await this.updateStaffUseCase.execute(id, user.doctorId, req.body as any);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Staff ID is required');
    }
    const user = getUserContext(req);
    await this.deleteStaffUseCase.execute(id, user.doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Staff ID is required');
    }
    const user = getUserContext(req);
    const result = await this.getStaffUseCase.execute(id, user.doctorId);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const user = getUserContext(req);
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
}



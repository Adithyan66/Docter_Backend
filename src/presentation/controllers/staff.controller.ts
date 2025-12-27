import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IStaffController } from '../interfaces/controllers/staff-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreateStaffUseCase,
  IUpdateStaffUseCase,
  IDeleteStaffUseCase,
  IGetStaffUseCase,
  IGetAllStaffUseCase,
} from '../../application/interfaces/use-cases/staff/staff-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { getUserContext } from '../utils/user-context.util';

@injectable()
export class StaffController implements IStaffController {
  constructor(
    @inject('ICreateStaffUseCase') private readonly createStaffUseCase: ICreateStaffUseCase,
    @inject('IUpdateStaffUseCase') private readonly updateStaffUseCase: IUpdateStaffUseCase,
    @inject('IDeleteStaffUseCase') private readonly deleteStaffUseCase: IDeleteStaffUseCase,
    @inject('IGetStaffUseCase') private readonly getStaffUseCase: IGetStaffUseCase,
    @inject('IGetAllStaffUseCase') private readonly getAllStaffUseCase: IGetAllStaffUseCase
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



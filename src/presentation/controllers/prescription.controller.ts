import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IPrescriptionController } from '../interfaces/controllers/prescription-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreatePrescriptionUseCase,
  IGetPrescriptionUseCase,
  IGetAllPrescriptionsUseCase,
  IUpdatePrescriptionUseCase,
  IDeletePrescriptionUseCase,
} from '../../application/interfaces/use-cases/prescription/prescription-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import {
  CreatePrescriptionRequestDto,
  PrescriptionResponseDto,
  GetPrescriptionsQueryDto,
  PaginatedPrescriptionsResponseDto,
  UpdatePrescriptionRequestDto,
} from '../dto/prescription.dto';
import { getUserId, getUserContext } from '../utils/user-context.util';

@injectable()
export class PrescriptionController implements IPrescriptionController {
  constructor(
    @inject('ICreatePrescriptionUseCase') private readonly createPrescriptionUseCase: ICreatePrescriptionUseCase,
    @inject('IGetPrescriptionUseCase') private readonly getPrescriptionUseCase: IGetPrescriptionUseCase,
    @inject('IGetAllPrescriptionsUseCase') private readonly getAllPrescriptionsUseCase: IGetAllPrescriptionsUseCase,
    @inject('IUpdatePrescriptionUseCase') private readonly updatePrescriptionUseCase: IUpdatePrescriptionUseCase,
    @inject('IDeletePrescriptionUseCase') private readonly deletePrescriptionUseCase: IDeletePrescriptionUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as CreatePrescriptionRequestDto;
    const prescription = await this.createPrescriptionUseCase.execute(doctorId, input);

    successResponse(res, prescription, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Prescription ID is required');
    }

    const doctorId = getUserId(req);
    const prescription = await this.getPrescriptionUseCase.execute(id, doctorId);

    successResponse(res, prescription, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const context = getUserContext(req);
    const query: GetPrescriptionsQueryDto = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      patientId: req.query.patientId ? String(req.query.patientId) : undefined,
      visitId: req.query.visitId ? String(req.query.visitId) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      medicineName: req.query.medicineName ? String(req.query.medicineName) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    };

    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }

    const result = await this.getAllPrescriptionsUseCase.execute(context.doctorId, query);

    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Prescription ID is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as UpdatePrescriptionRequestDto;
    const prescription = await this.updatePrescriptionUseCase.execute(id, doctorId, input);

    successResponse(res, prescription, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Prescription ID is required');
    }

    const doctorId = getUserId(req);
    await this.deletePrescriptionUseCase.execute(id, doctorId);

    successResponse(res, { message: 'Prescription deleted successfully' }, HttpStatus.OK, SuccessMessages.DELETED);
  }
}


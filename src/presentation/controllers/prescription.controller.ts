import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreatePrescriptionUseCase } from '../../application/use-cases/prescription/create-prescription.use-case';
import { GetPrescriptionUseCase } from '../../application/use-cases/prescription/get-prescription.use-case';
import { GetAllPrescriptionsUseCase } from '../../application/use-cases/prescription/get-all-prescriptions.use-case';
import { UpdatePrescriptionUseCase } from '../../application/use-cases/prescription/update-prescription.use-case';
import { DeletePrescriptionUseCase } from '../../application/use-cases/prescription/delete-prescription.use-case';
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
export class PrescriptionController {
  constructor(
    @inject('CreatePrescriptionUseCase') private readonly createPrescriptionUseCase: CreatePrescriptionUseCase,
    @inject('GetPrescriptionUseCase') private readonly getPrescriptionUseCase: GetPrescriptionUseCase,
    @inject('GetAllPrescriptionsUseCase') private readonly getAllPrescriptionsUseCase: GetAllPrescriptionsUseCase,
    @inject('UpdatePrescriptionUseCase') private readonly updatePrescriptionUseCase: UpdatePrescriptionUseCase,
    @inject('DeletePrescriptionUseCase') private readonly deletePrescriptionUseCase: DeletePrescriptionUseCase
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


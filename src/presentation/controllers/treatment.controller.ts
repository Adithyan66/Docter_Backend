import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages, AuthenticationErrors } from '../../infrastructure/constants';
import { CreateTreatmentUseCase } from '../../application/use-cases/treatment/create-treatment.use-case';
import { UpdateTreatmentUseCase } from '../../application/use-cases/treatment/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../../application/use-cases/treatment/delete-treatment.use-case';
import { GetTreatmentUseCase } from '../../application/use-cases/treatment/get-treatment.use-case';
import { GetAllTreatmentsUseCase } from '../../application/use-cases/treatment/get-all-treatments.use-case';
import { GetTreatmentNamesUseCase } from '../../application/use-cases/treatment/get-treatment-names.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateTreatmentRequestDto, UpdateTreatmentRequestDto, TreatmentResponseDto, PaginatedTreatmentsResponseDto, TreatmentList } from '../dto/treatment.dto';
import { Treatment } from '../../domain/entities/treatment.entity';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';

@injectable()
export class TreatmentController {
  constructor(
    @inject('CreateTreatmentUseCase') private readonly createTreatmentUseCase: CreateTreatmentUseCase,
    @inject('UpdateTreatmentUseCase') private readonly updateTreatmentUseCase: UpdateTreatmentUseCase,
    @inject('DeleteTreatmentUseCase') private readonly deleteTreatmentUseCase: DeleteTreatmentUseCase,
    @inject('GetTreatmentUseCase') private readonly getTreatmentUseCase: GetTreatmentUseCase,
    @inject('GetAllTreatmentsUseCase') private readonly getAllTreatmentsUseCase: GetAllTreatmentsUseCase,
    @inject('GetTreatmentNamesUseCase') private readonly getTreatmentNamesUseCase: GetTreatmentNamesUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = this.getDoctorId(req);
    const input = req.body as CreateTreatmentRequestDto;
    await this.createTreatmentUseCase.execute(doctorId, input);
    
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const doctorId = this.getDoctorId(req);
    const input = req.body as UpdateTreatmentRequestDto;
    await this.updateTreatmentUseCase.execute(id, doctorId, input);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const doctorId = this.getDoctorId(req);
    await this.deleteTreatmentUseCase.execute(id, doctorId);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const doctorId = this.getDoctorId(req);
    
    const includeStatistics = req.query.includeStatistics === 'true' || req.query.includeStatistics === '1';
    const startDateFrom = req.query.startDateFrom ? new Date(String(req.query.startDateFrom)) : undefined;
    const startDateTo = req.query.startDateTo ? new Date(String(req.query.startDateTo)) : undefined;
    const clinicId = req.query.clinicId ? String(req.query.clinicId) : undefined;
    const include = req.query.include ? String(req.query.include).split(',').map(s => s.trim()) : undefined;
    const exclude = req.query.exclude ? String(req.query.exclude).split(',').map(s => s.trim()) : undefined;

    if (startDateFrom && isNaN(startDateFrom.getTime())) {
      throw new ValidationError('Invalid startDateFrom format. Use ISO date string.');
    }
    if (startDateTo && isNaN(startDateTo.getTime())) {
      throw new ValidationError('Invalid startDateTo format. Use ISO date string.');
    }

    const result = await this.getTreatmentUseCase.execute(id, doctorId, {
      includeStatistics,
      startDateFrom,
      startDateTo,
      clinicId,
      include,
      exclude,
    });

    const response: TreatmentResponseDto = this.toResponseDto(result.treatment, result.statistics);
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const sortBy = req.query.sortBy as 'averageAmount' | 'averageDuration' | 'numberOfPatients' | 'ongoing' | 'completed' | '' | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
    const search = req.query.search as string | undefined;

    const validSortBy = sortBy && ['averageAmount', 'averageDuration', 'numberOfPatients', 'ongoing', 'completed', ''].includes(sortBy) ? sortBy : '';
    const validSortOrder = sortOrder && ['asc', 'desc'].includes(sortOrder) ? sortOrder : undefined;

    const doctorId = this.getDoctorId(req);
    const result = await this.getAllTreatmentsUseCase.execute(doctorId, page, limit, validSortBy, validSortOrder, search);
    
    const response: PaginatedTreatmentsResponseDto = {
      treatments: result.treatments as TreatmentList[],
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getNames(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const doctorId = this.getDoctorId(req);
    const search = req.query.search ? String(req.query.search) : undefined;
    const names = await this.getTreatmentNamesUseCase.execute(doctorId, search);
    successResponse(res, names, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private toResponseDto(treatment: Treatment, statistics?: any): TreatmentResponseDto {
    const dto: TreatmentResponseDto = {
      id: treatment.id,
      doctorId: treatment.doctorId,
      name: treatment.name,
      description: treatment.description,
      minDuration: treatment.minDuration,
      maxDuration: treatment.maxDuration,
      avgDuration: treatment.avgDuration,
      minFees: treatment.minFees,
      maxFees: treatment.maxFees,
      avgFees: treatment.avgFees,
      steps: treatment.steps,
      aftercare: treatment.aftercare,
      followUpRequired: treatment.followUpRequired,
      followUpAfterDays: treatment.followUpAfterDays,
      risks: treatment.risks,
      images: treatment.images,
      isOneTime: treatment.isOneTime,
      regularVisitInterval: treatment.regularVisitInterval,
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
    };

    if (statistics) {
      dto.statistics = statistics;
    }

    return dto;
  }

  private getDoctorId(req: HttpRequest): string {
    const user = req.user as { id?: string } | undefined;
    if (!user || !user.id) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    return user.id;
  }
}


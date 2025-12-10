import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateClinicUseCase } from '../../application/use-cases/clinic/create-clinic.use-case';
import { UpdateClinicUseCase } from '../../application/use-cases/clinic/update-clinic.use-case';
import { DeleteClinicUseCase } from '../../application/use-cases/clinic/delete-clinic.use-case';
import { GetClinicUseCase } from '../../application/use-cases/clinic/get-clinic.use-case';
import { GetAllClinicsUseCase } from '../../application/use-cases/clinic/get-all-clinics.use-case';
import { GetClinicNamesUseCase } from '../../application/use-cases/clinic/get-clinic-names.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateClinicRequestDto, UpdateClinicRequestDto, ClinicResponseDto, PaginatedClinicsResponseDto, ClinicListDto } from '../dto/clinic.dto';
import { GetClinicsParams } from '../../application/use-cases/clinic/get-all-clinics.use-case';
import { Clinic } from '../../domain/entities/clinic.entity';
import { getUserId } from '../utils/user-context.util';

@injectable()
export class ClinicController {
  constructor(
    @inject('CreateClinicUseCase') private readonly createClinicUseCase: CreateClinicUseCase,
    @inject('UpdateClinicUseCase') private readonly updateClinicUseCase: UpdateClinicUseCase,
    @inject('DeleteClinicUseCase') private readonly deleteClinicUseCase: DeleteClinicUseCase,
    @inject('GetClinicUseCase') private readonly getClinicUseCase: GetClinicUseCase,
    @inject('GetAllClinicsUseCase') private readonly getAllClinicsUseCase: GetAllClinicsUseCase,
    @inject('GetClinicNamesUseCase') private readonly getClinicNamesUseCase: GetClinicNamesUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as CreateClinicRequestDto;
    await this.createClinicUseCase.execute(doctorId, input);
    
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as UpdateClinicRequestDto;
    await this.updateClinicUseCase.execute(id, doctorId, input);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const doctorId = getUserId(req);
    await this.deleteClinicUseCase.execute(id, doctorId);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const doctorId = getUserId(req);
    
    const includeStatistics = req.query.includeStatistics === 'true' || req.query.includeStatistics === '1';
    const startDateFrom = req.query.startDateFrom ? new Date(String(req.query.startDateFrom)) : undefined;
    const startDateTo = req.query.startDateTo ? new Date(String(req.query.startDateTo)) : undefined;
    const treatmentId = req.query.treatmentId ? String(req.query.treatmentId) : undefined;
    const include = req.query.include ? String(req.query.include).split(',').map(s => s.trim()) : undefined;
    const exclude = req.query.exclude ? String(req.query.exclude).split(',').map(s => s.trim()) : undefined;

    if (startDateFrom && isNaN(startDateFrom.getTime())) {
      throw new ValidationError('Invalid startDateFrom format. Use ISO date string.');
    }
    if (startDateTo && isNaN(startDateTo.getTime())) {
      throw new ValidationError('Invalid startDateTo format. Use ISO date string.');
    }

    const result = await this.getClinicUseCase.execute(id, doctorId, {
      includeStatistics,
      startDateFrom,
      startDateTo,
      treatmentId,
      include,
      exclude,
    });

    const response: ClinicResponseDto = this.toResponseDto(result.clinic, result.statistics);
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const params: GetClinicsParams = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as 'createdAt' | 'numOfPatients' | 'onGoingTreatments' | 'completedTreatments' | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    };

    const doctorId = getUserId(req);
    const result = await this.getAllClinicsUseCase.execute(doctorId, params);
    const response: PaginatedClinicsResponseDto = {
      clinics: result.clinics as ClinicListDto[],
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getNames(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const doctorId = getUserId(req);
    const search = req.query.search ? String(req.query.search) : undefined;
    const names = await this.getClinicNamesUseCase.execute(doctorId, search);
    successResponse(res, names, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private toResponseDto(clinic: Clinic, statistics?: any): ClinicResponseDto {
    const dto: ClinicResponseDto = {
      id: clinic.id,
      clinicId: clinic.clinicId,
      doctorId: clinic.doctorId,
      name: clinic.name,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      pincode: clinic.pincode,
      phone: clinic.phone,
      email: clinic.email?.toString(),
      website: clinic.website,
      locationUrl: clinic.locationUrl,
      workingDays: clinic.workingDays?.map(wd => wd.toJSON()),
      treatments: clinic.populatedTreatments || undefined,
      images: clinic.images,
      notes: clinic.notes,
      isActive: clinic.isActive,
      isDeleted: clinic.isDeleted,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };

    if (statistics) {
      dto.statistics = statistics;
    }

    return dto;
  }
}


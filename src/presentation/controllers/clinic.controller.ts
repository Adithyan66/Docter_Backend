import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IClinicController } from '../interfaces/controllers/clinic-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreateClinicUseCase,
  IUpdateClinicUseCase,
  IDeleteClinicUseCase,
  IGetClinicUseCase,
  IGetAllClinicsUseCase,
  IGetClinicNamesUseCase,
  IGetClinicImagesUseCase,
  IAddClinicImagesUseCase,
  IDeleteClinicImageUseCase,
  GetClinicsParams,
} from '../../application/interfaces/use-cases/clinic/clinic-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateClinicRequestDto, UpdateClinicRequestDto, ClinicResponseDto, PaginatedClinicsResponseDto, ClinicListDto } from '../dto/clinic.dto';
import { Clinic } from '../../domain/entities/clinic.entity';
import { getUserContext, getClinicId, getUserId } from '../utils/user-context.util';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { AuthenticationErrors } from '../../infrastructure/constants/error-messages';

@injectable()
export class ClinicController implements IClinicController {
  constructor(
    @inject('ICreateClinicUseCase') private readonly createClinicUseCase: ICreateClinicUseCase,
    @inject('IUpdateClinicUseCase') private readonly updateClinicUseCase: IUpdateClinicUseCase,
    @inject('IDeleteClinicUseCase') private readonly deleteClinicUseCase: IDeleteClinicUseCase,
    @inject('IGetClinicUseCase') private readonly getClinicUseCase: IGetClinicUseCase,
    @inject('IGetAllClinicsUseCase') private readonly getAllClinicsUseCase: IGetAllClinicsUseCase,
    @inject('IGetClinicNamesUseCase') private readonly getClinicNamesUseCase: IGetClinicNamesUseCase,
    @inject('IGetClinicImagesUseCase') private readonly getClinicImagesUseCase: IGetClinicImagesUseCase,
    @inject('IDeleteClinicImageUseCase') private readonly deleteClinicImageUseCase: IDeleteClinicImageUseCase,
    @inject('IAddClinicImagesUseCase') private readonly addClinicImagesUseCase: IAddClinicImagesUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const userContext = getUserContext(req);
    const doctorId = userContext.doctorId;
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

    const userContext = getUserContext(req);
    const doctorId = userContext.doctorId;
    const staffClinicId = getClinicId(req);
    if (userContext.role === 'staff') {
      if (!staffClinicId || staffClinicId !== id) {
        throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
      }
    }

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

    const result = await this.getClinicUseCase.execute(id, {
      doctorId,
      role: userContext.role,
      clinicId: staffClinicId,
    }, {
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

  async getImages(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const userContext = getUserContext(req);
    const doctorId = userContext.doctorId;
    const staffClinicId = getClinicId(req);

    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

    const result = await this.getClinicImagesUseCase.execute(id, {
      doctorId,
      role: userContext.role,
      clinicId: staffClinicId,
    }, {
      page,
      limit,
    });

    const response = {
      images: result.images,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };

    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async deleteImage(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const imageIndexParam = req.params.imageIndex;
    if (!imageIndexParam) {
      throw new ValidationError('Image index is required');
    }

    const imageIndex = parseInt(imageIndexParam, 10);
    if (isNaN(imageIndex) || imageIndex < 0) {
      throw new ValidationError('Invalid image index');
    }

    const body = req.body as { imageUrl?: string };
    if (!body || !body.imageUrl || typeof body.imageUrl !== 'string' || body.imageUrl.trim().length === 0) {
      throw new ValidationError('Image URL is required in request body');
    }

    const userContext = getUserContext(req);
    const doctorId = userContext.doctorId;
    const staffClinicId = getClinicId(req);

    await this.deleteClinicImageUseCase.execute(id, imageIndex, body.imageUrl, {
      doctorId,
      role: userContext.role,
      clinicId: staffClinicId,
    });

    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async addImages(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
    const body = req.body as { images: string[] };

    if (!body.images || !Array.isArray(body.images)) {
      throw new ValidationError('images must be an array of image URLs');
    }

    await this.addClinicImagesUseCase.execute(id, doctorId, body.images);

    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
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


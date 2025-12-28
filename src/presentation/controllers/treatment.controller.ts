import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { ITreatmentController } from '../interfaces/controllers/treatment-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreateTreatmentUseCase,
  IUpdateTreatmentUseCase,
  IDeleteTreatmentUseCase,
  IGetTreatmentUseCase,
  IGetAllTreatmentsUseCase,
  IGetTreatmentNamesUseCase,
  IAddTreatmentImagesUseCase,
  IGetTreatmentImagesUseCase,
  IDeleteTreatmentImageUseCase,
} from '../../application/interfaces/use-cases/treatment/treatment-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateTreatmentRequestDto, UpdateTreatmentRequestDto, TreatmentResponseDto, PaginatedTreatmentsResponseDto, TreatmentList } from '../dto/treatment.dto';
import { Treatment } from '../../domain/entities/treatment.entity';
import { getUserId, getUserContext, getClinicId } from '../utils/user-context.util';

@injectable()
export class TreatmentController implements ITreatmentController {
  constructor(
    @inject('ICreateTreatmentUseCase') private readonly createTreatmentUseCase: ICreateTreatmentUseCase,
    @inject('IUpdateTreatmentUseCase') private readonly updateTreatmentUseCase: IUpdateTreatmentUseCase,
    @inject('IDeleteTreatmentUseCase') private readonly deleteTreatmentUseCase: IDeleteTreatmentUseCase,
    @inject('IGetTreatmentUseCase') private readonly getTreatmentUseCase: IGetTreatmentUseCase,
    @inject('IGetAllTreatmentsUseCase') private readonly getAllTreatmentsUseCase: IGetAllTreatmentsUseCase,
    @inject('IGetTreatmentNamesUseCase') private readonly getTreatmentNamesUseCase: IGetTreatmentNamesUseCase,
    @inject('IAddTreatmentImagesUseCase') private readonly addTreatmentImagesUseCase: IAddTreatmentImagesUseCase,
    @inject('IGetTreatmentImagesUseCase') private readonly getTreatmentImagesUseCase: IGetTreatmentImagesUseCase,
    @inject('IDeleteTreatmentImageUseCase') private readonly deleteTreatmentImageUseCase: IDeleteTreatmentImageUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
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

    const doctorId = getUserId(req);
    const input = req.body as UpdateTreatmentRequestDto;
    await this.updateTreatmentUseCase.execute(id, doctorId, input);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const doctorId = getUserId(req);
    await this.deleteTreatmentUseCase.execute(id, doctorId);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const context = getUserContext(req);
    
    const includeStatistics = req.query.includeStatistics === 'true' || req.query.includeStatistics === '1';
    const startDateFrom = req.query.startDateFrom ? new Date(String(req.query.startDateFrom)) : undefined;
    const startDateTo = req.query.startDateTo ? new Date(String(req.query.startDateTo)) : undefined;
    let clinicId = req.query.clinicId ? String(req.query.clinicId) : undefined;
    const include = req.query.include ? String(req.query.include).split(',').map(s => s.trim()) : undefined;
    const exclude = req.query.exclude ? String(req.query.exclude).split(',').map(s => s.trim()) : undefined;

    if (context.role === 'staff' && context.clinicId) {
      clinicId = context.clinicId;
    }

    if (startDateFrom && isNaN(startDateFrom.getTime())) {
      throw new ValidationError('Invalid startDateFrom format. Use ISO date string.');
    }
    if (startDateTo && isNaN(startDateTo.getTime())) {
      throw new ValidationError('Invalid startDateTo format. Use ISO date string.');
    }

    const result = await this.getTreatmentUseCase.execute(id, context.doctorId, {
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

    const doctorId = getUserId(req);
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
    const doctorId = getUserId(req);
    const search = req.query.search ? String(req.query.search) : undefined;
    const names = await this.getTreatmentNamesUseCase.execute(doctorId, search);
    successResponse(res, names, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getImages(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const doctorId = getUserId(req);
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

    const result = await this.getTreatmentImagesUseCase.execute(id, doctorId, {
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

  async addImages(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
    const body = req.body as { images: string[] };

    if (!body.images || !Array.isArray(body.images)) {
      throw new ValidationError('images must be an array of image URLs');
    }

    await this.addTreatmentImagesUseCase.execute(id, doctorId, body.images);

    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async deleteImage(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
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

    await this.deleteTreatmentImageUseCase.execute(id, imageIndex, body.imageUrl, {
      doctorId,
      role: userContext.role,
      clinicId: staffClinicId,
    });

    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
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
      isActive: treatment.isActive,
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
    };

    if (statistics) {
      dto.statistics = statistics;
    }

    return dto;
  }
}


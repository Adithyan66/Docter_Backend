import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateTreatmentUseCase } from '../../application/use-cases/treatment/create-treatment.use-case';
import { UpdateTreatmentUseCase } from '../../application/use-cases/treatment/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../../application/use-cases/treatment/delete-treatment.use-case';
import { GetTreatmentUseCase } from '../../application/use-cases/treatment/get-treatment.use-case';
import { GetAllTreatmentsUseCase } from '../../application/use-cases/treatment/get-all-treatments.use-case';
import { GetTreatmentNamesUseCase } from '../../application/use-cases/treatment/get-treatment-names.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateTreatmentRequestDto, UpdateTreatmentRequestDto, TreatmentResponseDto, PaginatedTreatmentsResponseDto } from '../dto/treatment.dto';
import { Treatment } from '../../domain/entities/treatment.entity';

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

    const input = req.body as CreateTreatmentRequestDto;
    await this.createTreatmentUseCase.execute(input);
    
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

    const input = req.body as UpdateTreatmentRequestDto;
    await this.updateTreatmentUseCase.execute(id, input);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    await this.deleteTreatmentUseCase.execute(id);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Treatment ID is required');
    }

    const treatment = await this.getTreatmentUseCase.execute(id);
    const response: TreatmentResponseDto = this.toResponseDto(treatment);
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const sortBy = req.query.sortBy as 'fees' | 'duration' | 'createdAt' | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
    const search = req.query.search as string | undefined;

    const validSortBy = sortBy && ['fees', 'duration', 'createdAt'].includes(sortBy) ? sortBy : undefined;
    const validSortOrder = sortOrder && ['asc', 'desc'].includes(sortOrder) ? sortOrder : undefined;

    const result = await this.getAllTreatmentsUseCase.execute(page, limit, validSortBy, validSortOrder, search);
    const response: PaginatedTreatmentsResponseDto = {
      treatments: result.treatments.map(t => this.toResponseDto(t)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getNames(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const search = req.query.search ? String(req.query.search) : undefined;
    const names = await this.getTreatmentNamesUseCase.execute(search);
    successResponse(res, names, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private toResponseDto(treatment: Treatment): TreatmentResponseDto {
    return {
      id: treatment.id,
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
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
    };
  }
}


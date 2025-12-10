import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateMediaUseCase } from '../../application/use-cases/media/create-media.use-case';
import { UpdateMediaUseCase } from '../../application/use-cases/media/update-media.use-case';
import { DeleteMediaUseCase } from '../../application/use-cases/media/delete-media.use-case';
import { GetMediaUseCase } from '../../application/use-cases/media/get-media.use-case';
import { GetAllMediaUseCase } from '../../application/use-cases/media/get-all-media.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateMediaRequestDto, UpdateMediaRequestDto, GetMediaQueryDto } from '../dto/media.dto';
import { getUserId, getUserContext } from '../utils/user-context.util';

@injectable()
export class MediaController {
  constructor(
    @inject('CreateMediaUseCase') private readonly createMediaUseCase: CreateMediaUseCase,
    @inject('UpdateMediaUseCase') private readonly updateMediaUseCase: UpdateMediaUseCase,
    @inject('DeleteMediaUseCase') private readonly deleteMediaUseCase: DeleteMediaUseCase,
    @inject('GetMediaUseCase') private readonly getMediaUseCase: GetMediaUseCase,
    @inject('GetAllMediaUseCase') private readonly getAllMediaUseCase: GetAllMediaUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const doctorId = getUserId(req);
    const input = req.body as CreateMediaRequestDto;
    const media = await this.createMediaUseCase.execute(doctorId, input);
    successResponse(res, media, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Media ID is required');
    }
    const doctorId = getUserId(req);
    const input = req.body as UpdateMediaRequestDto;
    const media = await this.updateMediaUseCase.execute(id, doctorId, input);
    successResponse(res, media, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Media ID is required');
    }
    const doctorId = getUserId(req);
    await this.deleteMediaUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Media ID is required');
    }
    const doctorId = getUserId(req);
    const media = await this.getMediaUseCase.execute(id, doctorId);
    successResponse(res, media, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const context = getUserContext(req);
    const query = this.buildQueryDto(req);
    
    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }
    
    const result = await this.getAllMediaUseCase.execute(context.doctorId, query);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private buildQueryDto(req: HttpRequest): GetMediaQueryDto {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const sortByCandidate = req.query.sortBy as 'createdAt' | 'type' | undefined;
    const allowedSortBy: Array<'createdAt' | 'type'> = ['createdAt', 'type'];
    const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
    const sortOrderCandidate = req.query.sortOrder as 'asc' | 'desc' | undefined;
    const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;

    return {
      page,
      limit,
      patientId: req.query.patientId ? String(req.query.patientId) : undefined,
      courseId: req.query.courseId ? String(req.query.courseId) : undefined,
      visitId: req.query.visitId ? String(req.query.visitId) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      type: req.query.type as 'image' | 'xray' | 'report' | 'other' | undefined,
      sortBy,
      sortOrder,
    };
  }
}


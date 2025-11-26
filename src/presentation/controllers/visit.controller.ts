import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateVisitUseCase } from '../../application/use-cases/visit/create-visit.use-case';
import { UpdateVisitUseCase } from '../../application/use-cases/visit/update-visit.use-case';
import { DeleteVisitUseCase } from '../../application/use-cases/visit/delete-visit.use-case';
import { GetVisitUseCase } from '../../application/use-cases/visit/get-visit.use-case';
import { GetAllVisitsUseCase } from '../../application/use-cases/visit/get-all-visits.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { CreateVisitRequestDto, UpdateVisitRequestDto, GetVisitsQueryDto } from '../dto/visit.dto';
import { AuthenticationErrors } from '../../infrastructure/constants';

@injectable()
export class VisitController {
  constructor(
    @inject('CreateVisitUseCase') private readonly createVisitUseCase: CreateVisitUseCase,
    @inject('UpdateVisitUseCase') private readonly updateVisitUseCase: UpdateVisitUseCase,
    @inject('DeleteVisitUseCase') private readonly deleteVisitUseCase: DeleteVisitUseCase,
    @inject('GetVisitUseCase') private readonly getVisitUseCase: GetVisitUseCase,
    @inject('GetAllVisitsUseCase') private readonly getAllVisitsUseCase: GetAllVisitsUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const doctorId = this.getDoctorId(req);
    const input = req.body as CreateVisitRequestDto;
    const visit = await this.createVisitUseCase.execute(doctorId, input);
    successResponse(res, visit, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Visit ID is required');
    }
    const doctorId = this.getDoctorId(req);
    const input = req.body as UpdateVisitRequestDto;
    const visit = await this.updateVisitUseCase.execute(id, doctorId, input);
    successResponse(res, visit, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Visit ID is required');
    }
    const doctorId = this.getDoctorId(req);
    await this.deleteVisitUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Visit ID is required');
    }
    const doctorId = this.getDoctorId(req);
    const visit = await this.getVisitUseCase.execute(id, doctorId);
    successResponse(res, visit, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const query = this.buildQueryDto(req);
    const doctorId = this.getDoctorId(req);
    const result = await this.getAllVisitsUseCase.execute(doctorId, query);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private buildQueryDto(req: HttpRequest): GetVisitsQueryDto {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const sortByCandidate = req.query.sortBy as 'visitDate' | 'createdAt' | undefined;
    const allowedSortBy: Array<'visitDate' | 'createdAt'> = ['visitDate', 'createdAt'];
    const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
    const sortOrderCandidate = req.query.sortOrder as 'asc' | 'desc' | undefined;
    const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;

    return {
      page,
      limit,
      patientId: req.query.patientId ? String(req.query.patientId) : undefined,
      courseId: req.query.courseId ? String(req.query.courseId) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      visitDateFrom: req.query.visitDateFrom ? String(req.query.visitDateFrom) : undefined,
      visitDateTo: req.query.visitDateTo ? String(req.query.visitDateTo) : undefined,
      notes: req.query.notes ? String(req.query.notes) : undefined,
      sortBy,
      sortOrder,
    };
  }

  private getDoctorId(req: HttpRequest): string {
    const user = req.user as { id?: string } | undefined;
    if (!user || !user.id) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    return user.id;
  }
}


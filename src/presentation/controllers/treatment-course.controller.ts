import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { ITreatmentCourseController } from '../interfaces/controllers/treatment-course-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreateTreatmentCourseUseCase,
  IUpdateTreatmentCourseUseCase,
  IDeleteTreatmentCourseUseCase,
  IGetTreatmentCourseUseCase,
  IGetAllTreatmentCoursesUseCase,
} from '../../application/interfaces/use-cases/treatment-course/treatment-course-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateTreatmentCourseRequestDto, UpdateTreatmentCourseRequestDto, GetTreatmentCoursesQueryDto } from '../dto/treatment-course.dto';
import { TreatmentCourseStatus } from '../../domain/value-objects/treatment-course-status.vo';
import { getUserId, getUserContext } from '../utils/user-context.util';

@injectable()
export class TreatmentCourseController implements ITreatmentCourseController {
  constructor(
    @inject('ICreateTreatmentCourseUseCase') private readonly createTreatmentCourseUseCase: ICreateTreatmentCourseUseCase,
    @inject('IUpdateTreatmentCourseUseCase') private readonly updateTreatmentCourseUseCase: IUpdateTreatmentCourseUseCase,
    @inject('IDeleteTreatmentCourseUseCase') private readonly deleteTreatmentCourseUseCase: IDeleteTreatmentCourseUseCase,
    @inject('IGetTreatmentCourseUseCase') private readonly getTreatmentCourseUseCase: IGetTreatmentCourseUseCase,
    @inject('IGetAllTreatmentCoursesUseCase') private readonly getAllTreatmentCoursesUseCase: IGetAllTreatmentCoursesUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const doctorId = getUserId(req);
    const input = req.body as CreateTreatmentCourseRequestDto;
    const treatmentCourse = await this.createTreatmentCourseUseCase.execute(doctorId, input);
    successResponse(res, treatmentCourse, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('TreatmentCourse ID is required');
    }
    const doctorId = getUserId(req);
    const input = req.body as UpdateTreatmentCourseRequestDto;
    const treatmentCourse = await this.updateTreatmentCourseUseCase.execute(id, doctorId, input);
    successResponse(res, treatmentCourse, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('TreatmentCourse ID is required');
    }
    const doctorId = getUserId(req);
    await this.deleteTreatmentCourseUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('TreatmentCourse ID is required');
    }
    const doctorId = getUserId(req);
    const treatmentCourse = await this.getTreatmentCourseUseCase.execute(id, doctorId);
    successResponse(res, treatmentCourse, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const context = getUserContext(req);
    const query = this.buildQueryDto(req);
    
    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }
    
    const result = await this.getAllTreatmentCoursesUseCase.execute(context.doctorId, query);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private buildQueryDto(req: HttpRequest): GetTreatmentCoursesQueryDto {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const sortByCandidate = req.query.sortBy as 'createdAt' | 'startDate' | 'totalCost' | 'status' | undefined;
    const allowedSortBy: Array<'createdAt' | 'startDate' | 'totalCost' | 'status'> = ['createdAt', 'startDate', 'totalCost', 'status'];
    const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
    const sortOrderCandidate = req.query.sortOrder as 'asc' | 'desc' | undefined;
    const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;
    const statusCandidate = req.query.status as TreatmentCourseStatus | undefined;
    const allowedStatuses: TreatmentCourseStatus[] = ['active', 'paused', 'completed', 'cancelled'];
    const status = statusCandidate && allowedStatuses.includes(statusCandidate) ? statusCandidate : undefined;

    return {
      page,
      limit,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      treatmentId: req.query.treatmentId ? String(req.query.treatmentId) : undefined,
      patientId: req.query.patientId ? String(req.query.patientId) : undefined,
      status,
      startDateFrom: req.query.startDateFrom ? String(req.query.startDateFrom) : undefined,
      startDateTo: req.query.startDateTo ? String(req.query.startDateTo) : undefined,
      sortBy,
      sortOrder,
    };
  }
}


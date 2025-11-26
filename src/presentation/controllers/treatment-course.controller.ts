import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateTreatmentCourseUseCase } from '../../application/use-cases/treatment-course/create-treatment-course.use-case';
import { UpdateTreatmentCourseUseCase } from '../../application/use-cases/treatment-course/update-treatment-course.use-case';
import { DeleteTreatmentCourseUseCase } from '../../application/use-cases/treatment-course/delete-treatment-course.use-case';
import { GetTreatmentCourseUseCase } from '../../application/use-cases/treatment-course/get-treatment-course.use-case';
import { GetAllTreatmentCoursesUseCase } from '../../application/use-cases/treatment-course/get-all-treatment-courses.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { CreateTreatmentCourseRequestDto, UpdateTreatmentCourseRequestDto, GetTreatmentCoursesQueryDto } from '../dto/treatment-course.dto';
import { TreatmentCourseStatus } from '../../domain/value-objects/treatment-course-status.vo';
import { AuthenticationErrors } from '../../infrastructure/constants';

@injectable()
export class TreatmentCourseController {
  constructor(
    @inject('CreateTreatmentCourseUseCase') private readonly createTreatmentCourseUseCase: CreateTreatmentCourseUseCase,
    @inject('UpdateTreatmentCourseUseCase') private readonly updateTreatmentCourseUseCase: UpdateTreatmentCourseUseCase,
    @inject('DeleteTreatmentCourseUseCase') private readonly deleteTreatmentCourseUseCase: DeleteTreatmentCourseUseCase,
    @inject('GetTreatmentCourseUseCase') private readonly getTreatmentCourseUseCase: GetTreatmentCourseUseCase,
    @inject('GetAllTreatmentCoursesUseCase') private readonly getAllTreatmentCoursesUseCase: GetAllTreatmentCoursesUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const doctorId = this.getDoctorId(req);
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
    const doctorId = this.getDoctorId(req);
    const input = req.body as UpdateTreatmentCourseRequestDto;
    const treatmentCourse = await this.updateTreatmentCourseUseCase.execute(id, doctorId, input);
    successResponse(res, treatmentCourse, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('TreatmentCourse ID is required');
    }
    const doctorId = this.getDoctorId(req);
    await this.deleteTreatmentCourseUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('TreatmentCourse ID is required');
    }
    const doctorId = this.getDoctorId(req);
    const treatmentCourse = await this.getTreatmentCourseUseCase.execute(id, doctorId);
    successResponse(res, treatmentCourse, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const query = this.buildQueryDto(req);
    const doctorId = this.getDoctorId(req);
    const result = await this.getAllTreatmentCoursesUseCase.execute(doctorId, query);
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

  private getDoctorId(req: HttpRequest): string {
    const user = req.user as { id?: string } | undefined;
    if (!user || !user.id) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    return user.id;
  }
}


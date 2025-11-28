import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages, AuthenticationErrors } from '../../infrastructure/constants';
import { CreatePatientUseCase } from '../../application/use-cases/patient/create-patient.use-case';
import { UpdatePatientUseCase } from '../../application/use-cases/patient/update-patient.use-case';
import { DeletePatientUseCase } from '../../application/use-cases/patient/delete-patient.use-case';
import { GetPatientsUseCase } from '../../application/use-cases/patient/get-patients.use-case';
import { GetPatientUseCase } from '../../application/use-cases/patient/get-patient.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { CreatePatientRequestDto, UpdatePatientRequestDto, GetPatientsQueryDto } from '../dto/patient.dto';
import { PatientConsultationType, PatientGender } from '../../domain/entities/patient.entity';

@injectable()
export class PatientController {
  constructor(
    @inject('CreatePatientUseCase') private readonly createPatientUseCase: CreatePatientUseCase,
    @inject('UpdatePatientUseCase') private readonly updatePatientUseCase: UpdatePatientUseCase,
    @inject('DeletePatientUseCase') private readonly deletePatientUseCase: DeletePatientUseCase,
    @inject('GetPatientsUseCase') private readonly getPatientsUseCase: GetPatientsUseCase,
    @inject('GetPatientUseCase') private readonly getPatientUseCase: GetPatientUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const doctorId = this.getDoctorId(req);
    const input = req.body as CreatePatientRequestDto;
    const patient = await this.createPatientUseCase.execute(doctorId, input);
    successResponse(res, patient, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Patient ID is required');
    }
    const doctorId = this.getDoctorId(req);
    const input = req.body as UpdatePatientRequestDto;
    const patient = await this.updatePatientUseCase.execute(id, doctorId, input);
    successResponse(res, patient, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Patient ID is required');
    }
    const doctorId = this.getDoctorId(req);
    await this.deletePatientUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }



  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {

    const id = req.params.id;

    if (!id) {
      throw new ValidationError('Patient ID is required');
    }

    const doctorId = this.getDoctorId(req);

    const patient = await this.getPatientUseCase.execute(id, doctorId);
    
    successResponse(res, patient, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }



  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {

    const query = this.buildQueryDto(req);
    
    const doctorId = this.getDoctorId(req);
    
    const result = await this.getPatientsUseCase.execute(doctorId, query);
    
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private buildQueryDto(req: HttpRequest): GetPatientsQueryDto {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const minAge = req.query.minAge ? parseInt(String(req.query.minAge), 10) : undefined;
    const maxAge = req.query.maxAge ? parseInt(String(req.query.maxAge), 10) : undefined;
    const sortByCandidate = req.query.sortBy as 'createdAt' | 'fullName' | 'visitCount' | 'lastVisitAt' | undefined;
    const allowedSortBy: Array<'createdAt' | 'fullName' | 'visitCount' | 'lastVisitAt'> = ['createdAt', 'fullName', 'visitCount', 'lastVisitAt'];
    const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
    const sortOrderCandidate = req.query.sortOrder as 'asc' | 'desc' | undefined;
    const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;
    const genderCandidate = req.query.gender as PatientGender | undefined;
    const allowedGenders: PatientGender[] = ['male', 'female', 'other', 'unknown'];
    const gender = genderCandidate && allowedGenders.includes(genderCandidate) ? genderCandidate : undefined;
    const consultationCandidate = req.query.consultationType as PatientConsultationType | undefined;
    const allowedConsultations: PatientConsultationType[] = ['one-time', 'treatment-plan'];
    const consultationType = consultationCandidate && allowedConsultations.includes(consultationCandidate) ? consultationCandidate : undefined;

    return {
      page,
      limit,
      search: req.query.search ? String(req.query.search) : undefined,
      patientId: req.query.patientId ? String(req.query.patientId) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      gender,
      consultationType,
      minAge,
      maxAge,
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



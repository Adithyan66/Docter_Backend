import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IPatientController } from '../interfaces/controllers/patient-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreatePatientUseCase,
  IUpdatePatientUseCase,
  IDeletePatientUseCase,
  IRestorePatientUseCase,
  IGetPatientsUseCase,
  IGetPatientUseCase,
} from '../../application/interfaces/use-cases/patient/patient-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreatePatientRequestDto, UpdatePatientRequestDto, GetPatientsQueryDto } from '../dto/patient.dto';
import { PatientConsultationType, PatientGender } from '../../domain/entities/patient.entity';
import { getUserId, getUserContext } from '../utils/user-context.util';

@injectable()
export class PatientController implements IPatientController {
  constructor(
    @inject('ICreatePatientUseCase') private readonly createPatientUseCase: ICreatePatientUseCase,
    @inject('IUpdatePatientUseCase') private readonly updatePatientUseCase: IUpdatePatientUseCase,
    @inject('IDeletePatientUseCase') private readonly deletePatientUseCase: IDeletePatientUseCase,
    @inject('IRestorePatientUseCase') private readonly restorePatientUseCase: IRestorePatientUseCase,
    @inject('IGetPatientsUseCase') private readonly getPatientsUseCase: IGetPatientsUseCase,
    @inject('IGetPatientUseCase') private readonly getPatientUseCase: IGetPatientUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    const doctorId = getUserId(req);
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
    const doctorId = getUserId(req);
    const input = req.body as UpdatePatientRequestDto;
    const patient = await this.updatePatientUseCase.execute(id, doctorId, input);
    successResponse(res, patient, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Patient ID is required');
    }
    const doctorId = getUserId(req);
    await this.deletePatientUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async restore(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Patient ID is required');
    }
    const doctorId = getUserId(req);
    await this.restorePatientUseCase.execute(id, doctorId);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }



  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {

    const id = req.params.id;

    if (!id) {
      throw new ValidationError('Patient ID is required');
    }

    const doctorId = getUserId(req);

    const patient = await this.getPatientUseCase.executeDetail(id, doctorId);
    
    successResponse(res, patient, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }



  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {

    const context = getUserContext(req);
    const query = this.buildQueryDto(req);
    
    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }
    
    const result = await this.getPatientsUseCase.execute(context.doctorId, query);
    
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
}



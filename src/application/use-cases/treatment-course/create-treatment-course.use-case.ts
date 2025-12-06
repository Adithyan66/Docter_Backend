import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { TreatmentCourse } from '../../../domain/entities/treatment-course.entity';
import { CreateTreatmentCourseRequestDto, TreatmentCourseResponseDto } from '../../../presentation/dto/treatment-course.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { treatmentCourseToDto } from '../../mappers/treatment-course.mapper';

@injectable()
export class CreateTreatmentCourseUseCase {
  constructor(
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(doctorId: string, input: CreateTreatmentCourseRequestDto): Promise<TreatmentCourseResponseDto> {
    this.validateInput(input);

    await this.validateReferences(doctorId, input);

    const startDate = this.parseDate(input.startDate, 'startDate');
    const expectedEndDate = input.expectedEndDate ? this.parseDate(input.expectedEndDate, 'expectedEndDate') : undefined;
    const lastVisitDate = input.lastVisitDate ? this.parseDate(input.lastVisitDate, 'lastVisitDate') : undefined;
    const nextVisitDate = input.nextVisitDate ? this.parseDate(input.nextVisitDate, 'nextVisitDate') : undefined;

    if (expectedEndDate && expectedEndDate <= startDate) {
      throw new ValidationError('expectedEndDate must be after startDate');
    }

    if (lastVisitDate && nextVisitDate && nextVisitDate <= lastVisitDate) {
      throw new ValidationError('nextVisitDate must be after lastVisitDate');
    }

    if (nextVisitDate && nextVisitDate <= new Date()) {
      throw new ValidationError('nextVisitDate must be in the future');
    }

    const treatmentCourse = new TreatmentCourse(
      '',
      doctorId,
      input.patientId.trim(),
      input.treatmentId.trim(),
      startDate,
      input.totalCost,
      undefined,
      undefined,
      input.clinicId ? input.clinicId.trim() : undefined,
      expectedEndDate,
      lastVisitDate,
      nextVisitDate,
      input.totalPaid || 0,
      false,
      false,
      input.status || 'active',
      input.notes ? input.notes.trim() : undefined,
      input.visits || [],
      input.payments || [],
      false
    );

    treatmentCourse.recalcPaymentStatus();

    const created = await this.treatmentCourseRepository.create(treatmentCourse);
    
    const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
    if (patient) {
      patient.addTreatmentCourse(created.id);
      await this.patientRepository.update(patient.id, patient);
    }
    
    return treatmentCourseToDto(created);
  }

  private validateInput(input: CreateTreatmentCourseRequestDto): void {
    if (!input.patientId || input.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }
    if (!input.treatmentId || input.treatmentId.trim().length === 0) {
      throw new ValidationError('treatmentId is required');
    }
    if (!input.startDate) {
      throw new ValidationError('startDate is required');
    }
    if (input.totalCost === undefined || input.totalCost < 0) {
      throw new ValidationError('totalCost is required and must be non-negative');
    }
    if (input.totalPaid !== undefined && input.totalPaid < 0) {
      throw new ValidationError('totalPaid must be non-negative');
    }
  }

  private async validateReferences(doctorId: string, input: CreateTreatmentCourseRequestDto): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new ValidationError('Doctor not found');
    }

    const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
    if (!patient) {
      throw new ValidationError('Patient not found or does not belong to doctor');
    }

    const treatment = await this.treatmentRepository.findById(input.treatmentId.trim());
    if (!treatment || treatment.doctorId !== doctorId) {
      throw new ValidationError('Treatment not found or does not belong to doctor');
    }

    if (input.clinicId) {
      const clinic = await this.clinicRepository.findById(input.clinicId.trim());
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('Clinic not found or does not belong to doctor');
      }
    }

    const existingTreatmentCourse = await this.treatmentCourseRepository.findByPatientAndTreatmentAndStatus(
      doctorId,
      input.patientId.trim(),
      input.treatmentId.trim(),
      ['active', 'paused']
    );

    if (existingTreatmentCourse) {
      throw new ValidationError('Treatment course with this treatment already exists for this patient');
    }
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid ${field} value`);
    }
    return date;
  }
}


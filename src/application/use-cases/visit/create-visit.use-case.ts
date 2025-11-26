import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { Visit } from '../../../domain/entities/visit.entity';
import { CreateVisitRequestDto, VisitResponseDto } from '../../../presentation/dto/visit.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { visitToDto } from '../../mappers/visit.mapper';

@injectable()
export class CreateVisitUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository
  ) {}

  async execute(doctorId: string, input: CreateVisitRequestDto): Promise<VisitResponseDto> {
    this.validateInput(input);

    await this.validateReferences(doctorId, input);

    const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
    if (!course) {
      throw new ValidationError('TreatmentCourse not found');
    }

    if (course.patientId !== input.patientId.trim()) {
      throw new ValidationError('Patient mismatch: Visit.patient must equal TreatmentCourse.patient');
    }

    let clinicId = input.clinicId ? input.clinicId.trim() : undefined;
    if (!clinicId && course.clinicId) {
      clinicId = course.clinicId;
    }

    const visitDate = new Date();

    const visit = new Visit(
      '',
      doctorId,
      input.patientId.trim(),
      input.courseId.trim(),
      visitDate,
      undefined,
      undefined,
      clinicId,
      input.notes ? input.notes.trim() : undefined,
      input.billedAmount !== undefined ? input.billedAmount : 0,
      input.mediaIds || [],
      input.prescriptionId ? input.prescriptionId.trim() : undefined,
      false
    );

    const created = await this.visitRepository.create(visit);

    const patient = await this.patientRepository.findById(input.patientId.trim());
    if (patient) {
      patient.incrementVisitCount(visitDate);
      await this.patientRepository.update(patient.id, patient);
    }

    course.addVisit(created.id);
    await this.treatmentCourseRepository.update(course.id, course);

    return visitToDto(created);
  }

  private validateInput(input: CreateVisitRequestDto): void {
    if (!input.patientId || input.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }
    if (!input.courseId || input.courseId.trim().length === 0) {
      throw new ValidationError('courseId is required');
    }
    if (input.billedAmount !== undefined && input.billedAmount < 0) {
      throw new ValidationError('billedAmount must be non-negative');
    }
  }

  private async validateReferences(doctorId: string, input: CreateVisitRequestDto): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new ValidationError('Doctor not found');
    }

    const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
    if (!patient) {
      throw new ValidationError('Patient not found or does not belong to doctor');
    }

    const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
    if (!course || course.doctorId !== doctorId) {
      throw new ValidationError('TreatmentCourse not found or does not belong to doctor');
    }
  }
}


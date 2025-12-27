import { injectable, inject } from 'tsyringe';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Media } from '../../../domain/entities/media.entity';
import { CreateMediaRequestDto, MediaResponseDto } from '../../../presentation/dto/media.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { mediaToDto } from '../../mappers/media.mapper';
import { ICreateMediaUseCase } from '../../interfaces/use-cases/media/media-use-cases.interface';

@injectable()
export class CreateMediaUseCase implements ICreateMediaUseCase {
  constructor(
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(doctorId: string, input: CreateMediaRequestDto): Promise<MediaResponseDto> {
    this.validateInput(input);

    await this.validateReferences(doctorId, input);

    const media = new Media(
      '',
      doctorId,
      input.url.trim(),
      input.type || 'image',
      undefined,
      undefined,
      input.patientId ? input.patientId.trim() : undefined,
      input.courseId ? input.courseId.trim() : undefined,
      input.visitId ? input.visitId.trim() : undefined,
      input.clinicId ? input.clinicId.trim() : undefined,
      input.filename ? input.filename.trim() : undefined,
      input.mimeType ? input.mimeType.trim() : undefined,
      input.size,
      input.notes ? input.notes.trim() : undefined,
      false
    );

    const created = await this.mediaRepository.create(media);
    return mediaToDto(created);
  }

  private validateInput(input: CreateMediaRequestDto): void {
    if (!input.url || input.url.trim().length === 0) {
      throw new ValidationError('url is required');
    }
    if (input.size !== undefined && input.size < 0) {
      throw new ValidationError('size must be non-negative');
    }
  }

  private async validateReferences(doctorId: string, input: CreateMediaRequestDto): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new ValidationError('Doctor not found');
    }

    if (input.patientId) {
      const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
      if (!patient) {
        throw new ValidationError('Patient not found or does not belong to doctor');
      }
    }

    if (input.courseId) {
      const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
      if (!course || course.doctorId !== doctorId) {
        throw new ValidationError('TreatmentCourse not found or does not belong to doctor');
      }
    }

    if (input.visitId) {
      const visit = await this.visitRepository.findById(input.visitId.trim());
      if (!visit || visit.doctorId !== doctorId) {
        throw new ValidationError('Visit not found or does not belong to doctor');
      }
    }

    if (input.clinicId) {
      const clinic = await this.clinicRepository.findById(input.clinicId.trim());
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('Clinic not found or does not belong to doctor');
      }
    }
  }
}


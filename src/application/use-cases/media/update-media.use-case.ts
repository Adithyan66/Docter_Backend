import { injectable, inject } from 'tsyringe';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Media } from '../../../domain/entities/media.entity';
import { UpdateMediaRequestDto, MediaResponseDto } from '../../../presentation/dto/media.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { mediaToDto } from '../../mappers/media.mapper';
import { IUpdateMediaUseCase } from '../../interfaces/use-cases/media/media-use-cases.interface';

@injectable()
export class UpdateMediaUseCase implements IUpdateMediaUseCase {
  constructor(
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateMediaRequestDto): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findByIdAndDoctor(id, doctorId);
    if (!media) {
      throw new NotFoundError('Media', id);
    }

    if (input.size !== undefined && input.size < 0) {
      throw new ValidationError('size must be non-negative');
    }

    await this.validateReferences(doctorId, input);

    const updateData: Partial<Media> = {};

    if (input.patientId !== undefined) {
      updateData.patientId = input.patientId ? input.patientId.trim() : undefined;
    }
    if (input.courseId !== undefined) {
      updateData.courseId = input.courseId ? input.courseId.trim() : undefined;
    }
    if (input.visitId !== undefined) {
      updateData.visitId = input.visitId ? input.visitId.trim() : undefined;
    }
    if (input.clinicId !== undefined) {
      updateData.clinicId = input.clinicId ? input.clinicId.trim() : undefined;
    }
    if (input.url !== undefined) {
      updateData.url = input.url.trim();
    }
    if (input.filename !== undefined) {
      updateData.filename = input.filename ? input.filename.trim() : undefined;
    }
    if (input.mimeType !== undefined) {
      updateData.mimeType = input.mimeType ? input.mimeType.trim() : undefined;
    }
    if (input.size !== undefined) {
      updateData.size = input.size;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes ? input.notes.trim() : undefined;
    }

    const updated = await this.mediaRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Media', id);
    }

    return mediaToDto(updated);
  }

  private async validateReferences(doctorId: string, input: UpdateMediaRequestDto): Promise<void> {
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


import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { Visit } from '../../../domain/entities/visit.entity';
import { VisitResponseDto, UpdateVisitRequestDto } from '../../../presentation/dto/visit.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { visitToDto } from '../../mappers/visit.mapper';

@injectable()
export class UpdateVisitUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateVisitRequestDto): Promise<VisitResponseDto> {
    const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
    if (!visit) {
      throw new NotFoundError('Visit', id);
    }

    if (input.patientId || input.courseId) {
      const courseId = input.courseId ? input.courseId.trim() : visit.courseId;
      const course = await this.treatmentCourseRepository.findById(courseId);
      if (!course) {
        throw new ValidationError('TreatmentCourse not found');
      }

      const patientId = input.patientId ? input.patientId.trim() : visit.patientId;
      if (course.patientId !== patientId) {
        throw new ValidationError('Patient mismatch: Visit.patient must equal TreatmentCourse.patient');
      }
    }

    const updateData: Partial<Visit> = {};

    if (input.patientId !== undefined) {
      updateData.patientId = input.patientId.trim();
    }
    if (input.courseId !== undefined) {
      updateData.courseId = input.courseId.trim();
    }
    if (input.clinicId !== undefined) {
      updateData.clinicId = input.clinicId ? input.clinicId.trim() : undefined;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes ? input.notes.trim() : undefined;
    }
    if (input.billedAmount !== undefined) {
      if (input.billedAmount < 0) {
        throw new ValidationError('billedAmount must be non-negative');
      }
      updateData.billedAmount = input.billedAmount;
    }
    if (input.mediaIds !== undefined) {
      updateData.mediaIds = input.mediaIds;
    }
    if (input.prescriptionId !== undefined) {
      updateData.prescriptionId = input.prescriptionId ? input.prescriptionId.trim() : undefined;
    }

    const updated = await this.visitRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Visit', id);
    }

    return visitToDto(updated);
  }
}


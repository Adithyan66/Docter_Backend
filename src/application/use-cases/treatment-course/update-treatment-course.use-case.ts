import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { UpdateTreatmentCourseRequestDto, TreatmentCourseResponseDto } from '../../../presentation/dto/treatment-course.dto';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { treatmentCourseToDto } from '../../mappers/treatment-course.mapper';

@injectable()
export class UpdateTreatmentCourseUseCase {
  constructor(
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateTreatmentCourseRequestDto): Promise<TreatmentCourseResponseDto> {
    if (!input || Object.keys(input).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const treatmentCourse = await this.treatmentCourseRepository.findByIdAndDoctor(id, doctorId);
    if (!treatmentCourse) {
      throw new NotFoundError('TreatmentCourse', id);
    }

    const updateData: Partial<typeof treatmentCourse> = {};

 

    if (input.startDate !== undefined) {
      const startDate = this.parseDate(input.startDate, 'startDate');
      updateData.startDate = startDate;

      if (treatmentCourse.expectedEndDate && treatmentCourse.expectedEndDate <= startDate) {
        throw new ValidationError('expectedEndDate must be after startDate');
      }
    }

    if (input.expectedEndDate !== undefined) {
      if (input.expectedEndDate === null) {
        updateData.expectedEndDate = undefined;
      } else {
        const expectedEndDate = this.parseDate(input.expectedEndDate, 'expectedEndDate');
        const startDate = input.startDate ? this.parseDate(input.startDate, 'startDate') : treatmentCourse.startDate;
        if (expectedEndDate <= startDate) {
          throw new ValidationError('expectedEndDate must be after startDate');
        }
        updateData.expectedEndDate = expectedEndDate;
      }
    }

    if (input.totalPaid !== undefined) {
      if (input.totalPaid < 0) {
        throw new ValidationError('totalPaid must be non-negative');
      }
      updateData.totalPaid = input.totalPaid;
    }

    if (input.totalCost !== undefined) {
      if (input.totalCost < 0) {
        throw new ValidationError('totalCost must be non-negative');
      }
      const currentOrNewTotalPaid = input.totalPaid !== undefined ? input.totalPaid : treatmentCourse.totalPaid;
      if (input.totalCost < currentOrNewTotalPaid) {
        throw new ValidationError(`totalCost cannot be less than totalPaid (${currentOrNewTotalPaid})`);
      }
      updateData.totalCost = input.totalCost;
    }

    if (input.isPaymentCompleted !== undefined) {
      updateData.isPaymentCompleted = input.isPaymentCompleted;
    }

    if (input.isMedicallyCompleted !== undefined) {
      updateData.isMedicallyCompleted = input.isMedicallyCompleted;
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.notes !== undefined) {
      updateData.notes = input.notes === null ? undefined : input.notes.trim();
    }

    if (input.visits !== undefined) {
      updateData.visits = input.visits;
    }

    if (input.payments !== undefined) {
      updateData.payments = input.payments;
    }

    const updated = await this.treatmentCourseRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('TreatmentCourse', id);
    }

    if (updateData.totalPaid !== undefined || updateData.totalCost !== undefined) {
      updated.recalcPaymentStatus();
      const finalUpdated = await this.treatmentCourseRepository.update(id, { isPaymentCompleted: updated.isPaymentCompleted });
      if (finalUpdated) {
        return treatmentCourseToDto(finalUpdated);
      }
    }

    return treatmentCourseToDto(updated);
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid ${field} value`);
    }
    return date;
  }
}


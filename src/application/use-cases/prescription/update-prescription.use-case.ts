import { injectable, inject } from 'tsyringe';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Prescription } from '../../../domain/entities/prescription.entity';
import { PrescriptionResponseDto, UpdatePrescriptionRequestDto } from '../../../presentation/dto/prescription.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { prescriptionToDto } from '../../mappers/prescription.mapper';

@injectable()
export class UpdatePrescriptionUseCase {
  constructor(
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdatePrescriptionRequestDto): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionRepository.findByIdAndDoctor(id, doctorId);
    if (!prescription) {
      throw new NotFoundError('Prescription', id);
    }

    if (input.items !== undefined) {
      if (input.items.length === 0) {
        throw new ValidationError('At least one prescription item is required');
      }
      input.items.forEach((item, index) => {
        if (!item.medicineName || item.medicineName.trim().length === 0) {
          throw new ValidationError(`Item ${index + 1}: medicineName is required`);
        }
      });
    }

    if (input.visitId) {
      const visit = await this.visitRepository.findById(input.visitId.trim());
      if (!visit || visit.doctorId !== doctorId) {
        throw new ValidationError('Visit not found or does not belong to doctor');
      }
      if (visit.patientId !== prescription.patient) {
        throw new ValidationError('Patient mismatch: Prescription.patient must equal Visit.patient');
      }
    }

    if (input.clinicId !== undefined) {
      if (input.clinicId) {
        const clinic = await this.clinicRepository.findById(input.clinicId.trim());
        if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
          throw new ValidationError('Clinic not found or does not belong to doctor');
        }
      }
    }

    const updateData: Partial<Prescription> = {};

    if (input.visitId !== undefined) {
      updateData.visit = input.visitId.trim();
    }
    if (input.clinicId !== undefined) {
      updateData.clinic = input.clinicId ? input.clinicId.trim() : undefined;
    }
    if (input.diagnosis !== undefined) {
      updateData.diagnosis = input.diagnosis;
    }
    if (input.items !== undefined) {
      updateData.items = input.items;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes ? input.notes.trim() : undefined;
    }

    const updated = await this.prescriptionRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Prescription', id);
    }

    return prescriptionToDto(updated);
  }
}


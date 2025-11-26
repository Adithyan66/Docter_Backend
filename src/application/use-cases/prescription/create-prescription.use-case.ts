import { injectable, inject } from 'tsyringe';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Prescription } from '../../../domain/entities/prescription.entity';
import { CreatePrescriptionRequestDto, PrescriptionResponseDto } from '../../../presentation/dto/prescription.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { prescriptionToDto } from '../../mappers/prescription.mapper';

@injectable()
export class CreatePrescriptionUseCase {
  constructor(
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(doctorId: string, input: CreatePrescriptionRequestDto): Promise<PrescriptionResponseDto> {
    this.validateInput(input);

    await this.validateReferences(doctorId, input);

    const prescription = new Prescription(
      '',
      doctorId,
      input.patientId.trim(),
      input.visitId.trim(),
      input.items || [],
      undefined,
      undefined,
      input.clinicId ? input.clinicId.trim() : undefined,
      input.diagnosis || [],
      input.notes ? input.notes.trim() : undefined
    );

    const created = await this.prescriptionRepository.create(prescription);

    return prescriptionToDto(created);
  }

  private validateInput(input: CreatePrescriptionRequestDto): void {
    if (!input.patientId || input.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }
    if (!input.visitId || input.visitId.trim().length === 0) {
      throw new ValidationError('visitId is required');
    }
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('At least one prescription item is required');
    }
    input.items.forEach((item, index) => {
      if (!item.medicineName || item.medicineName.trim().length === 0) {
        throw new ValidationError(`Item ${index + 1}: medicineName is required`);
      }
    });
  }

  private async validateReferences(doctorId: string, input: CreatePrescriptionRequestDto): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new ValidationError('Doctor not found');
    }

    const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
    if (!patient) {
      throw new ValidationError('Patient not found or does not belong to doctor');
    }

    const visit = await this.visitRepository.findById(input.visitId.trim());
    if (!visit || visit.doctorId !== doctorId) {
      throw new ValidationError('Visit not found or does not belong to doctor');
    }

    if (visit.patientId !== input.patientId.trim()) {
      throw new ValidationError('Patient mismatch: Prescription.patient must equal Visit.patient');
    }

    if (input.clinicId) {
      const clinic = await this.clinicRepository.findById(input.clinicId.trim());
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('Clinic not found or does not belong to doctor');
      }
    }
  }
}


import { Prescription } from '../../domain/entities/prescription.entity';
import { PrescriptionResponseDto } from '../../presentation/dto/prescription.dto';

export const prescriptionToDto = (prescription: Prescription): PrescriptionResponseDto => ({
  id: prescription.id,
  doctorId: prescription.doctor,
  patientId: prescription.patient,
  visitId: prescription.visit,
  clinicId: prescription.clinic,
  diagnosis: prescription.diagnosis || [],
  items: prescription.items || [],
  notes: prescription.notes,
  createdAt: prescription.createdAt,
  updatedAt: prescription.updatedAt,
});


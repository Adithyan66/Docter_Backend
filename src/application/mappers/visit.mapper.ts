import { Visit } from '../../domain/entities/visit.entity';
import { VisitResponseDto } from '../../presentation/dto/visit.dto';

export const visitToDto = (visit: Visit): VisitResponseDto => ({
  id: visit.id,
  doctorId: visit.doctorId,
  patientId: visit.patientId,
  courseId: visit.courseId,
  clinicId: visit.clinicId,
  visitDate: visit.visitDate,
  notes: visit.notes,
  billedAmount: visit.billedAmount,
  mediaIds: visit.mediaIds || [],
  prescriptionId: visit.prescriptionId,
  isDeleted: visit.isDeleted,
  createdAt: visit.createdAt,
  updatedAt: visit.updatedAt,
});


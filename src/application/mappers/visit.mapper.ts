import { Visit } from '../../domain/entities/visit.entity';
import { Prescription } from '../../domain/entities/prescription.entity';
import { Media } from '../../domain/entities/media.entity';
import { VisitResponseDto } from '../../presentation/dto/visit.dto';
import { prescriptionToDto } from './prescription.mapper';
import { mediaToDto } from './media.mapper';

export const visitToDto = (
  visit: Visit,
  prescription?: Prescription | null,
  media?: Media[]
): VisitResponseDto => {
  const dto: VisitResponseDto = {
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
  };

  if (prescription !== undefined) {
    dto.prescription = prescription ? prescriptionToDto(prescription) : null;
  }

  if (media !== undefined) {
    dto.media = media.map(mediaToDto);
  }

  return dto;
};


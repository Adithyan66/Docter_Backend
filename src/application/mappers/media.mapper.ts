import { Media } from '../../domain/entities/media.entity';
import { MediaResponseDto } from '../../presentation/dto/media.dto';

export const mediaToDto = (media: Media): MediaResponseDto => ({
  id: media.id,
  doctorId: media.doctorId,
  patientId: media.patientId,
  courseId: media.courseId,
  visitId: media.visitId,
  clinicId: media.clinicId,
  url: media.url,
  filename: media.filename,
  mimeType: media.mimeType,
  size: media.size,
  type: media.type,
  notes: media.notes,
  isDeleted: media.isDeleted,
  createdAt: media.createdAt,
  updatedAt: media.updatedAt,
});


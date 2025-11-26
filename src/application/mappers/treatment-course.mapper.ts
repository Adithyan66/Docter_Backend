import { TreatmentCourse } from '../../domain/entities/treatment-course.entity';
import { TreatmentCourseResponseDto } from '../../presentation/dto/treatment-course.dto';

export const treatmentCourseToDto = (treatmentCourse: TreatmentCourse): TreatmentCourseResponseDto => ({
  id: treatmentCourse.id,
  doctorId: treatmentCourse.doctorId,
  patientId: treatmentCourse.patientId,
  clinicId: treatmentCourse.clinicId,
  treatmentId: treatmentCourse.treatmentId,
  startDate: treatmentCourse.startDate,
  expectedEndDate: treatmentCourse.expectedEndDate,
  totalCost: treatmentCourse.totalCost,
  totalPaid: treatmentCourse.totalPaid,
  remaining: treatmentCourse.remaining,
  isPaymentCompleted: treatmentCourse.isPaymentCompleted,
  isMedicallyCompleted: treatmentCourse.isMedicallyCompleted,
  status: treatmentCourse.status,
  notes: treatmentCourse.notes,
  visits: treatmentCourse.visits || [],
  payments: treatmentCourse.payments || [],
  isDeleted: treatmentCourse.isDeleted,
  createdAt: treatmentCourse.createdAt,
  updatedAt: treatmentCourse.updatedAt,
});


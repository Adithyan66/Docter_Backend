import { Patient } from '../../domain/entities/patient.entity';
import { PatientResponseDto } from '../../presentation/dto/patient.dto';

export const patientToDto = (
  patient: Patient,
  treatmentCoursesData?: Array<{ id: string; treatmentName: string }>
): PatientResponseDto => ({
  id: patient.id,
  doctorId: patient.doctorId,
  primaryClinic: patient.primaryClinic,
  clinics: patient.clinics || [],
  patientId: patient.patientId?.toString(),
  firstName: patient.firstName,
  lastName: patient.lastName,
  fullName: patient.fullName,
  dob: patient.dob,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone?.toString(),
  email: patient.email?.toString(),
  address: patient.address,
  profilePicUrl: patient.profilePicUrl,
  consultationType: patient.consultationType,
  tags: patient.tags || [],
  treatmentCourses: treatmentCoursesData || [],
  visitCount: patient.visitCount,
  lastVisitAt: patient.lastVisitAt,
  isActive: patient.isActive,
  isDeleted: patient.isDeleted,
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});



import { Patient } from '../../domain/entities/patient.entity';
import { PatientResponseDto, PatientDetailResponseDto, TreatmentCoursesSummaryDto } from '../../presentation/dto/patient.dto';

export const patientToDto = (
  patient: Patient,
  treatmentCoursesData?: Array<{ id: string; treatmentName: string }>,
  primaryClinicName?: string
): PatientResponseDto => ({
  id: patient.id,
  // doctorId: patient.doctorId,
  // primaryClinic: patient.primaryClinic,
  primaryClinicName: primaryClinicName,
  // clinics: patient.clinics || [],
  patientId: patient.patientId?.toString(),
  // firstName: patient.firstName,
  // lastName: patient.lastName,
  fullName: patient.fullName,
  // dob: patient.dob,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone?.toString(),
  email: patient.email?.toString(),
  // address: patient.address,
  profilePicUrl: patient.profilePicUrl,
  consultationType: patient.consultationType,
  // tags: patient.tags || [],
  // treatmentCourses: treatmentCoursesData || [],
  visitCount: patient.visitCount,
  lastVisitAt: patient.lastVisitAt,
  isActive: patient.isActive,
  // isDeleted: patient.isDeleted,
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});

export const patientToDetailDto = (
  patient: Patient,
  treatmentCourses: Array<{ id: string; treatmentName: string }>,
  treatmentCoursesSummary: TreatmentCoursesSummaryDto,
  primaryClinicName?: string
): PatientDetailResponseDto => ({
  id: patient.id,
  doctorId: patient.doctorId,
  primaryClinic: patient.primaryClinic,
  primaryClinicName: primaryClinicName,
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
  visitCount: patient.visitCount,
  lastVisitAt: patient.lastVisitAt,
  isActive: patient.isActive,
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
  treatmentCourses: treatmentCourses,
  treatmentCoursesSummary: treatmentCoursesSummary,
});



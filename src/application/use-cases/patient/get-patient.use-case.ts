import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { PatientResponseDto, PatientDetailResponseDto, TreatmentCoursesSummaryDto } from '../../../presentation/dto/patient.dto';
import { patientToDto, patientToDetailDto } from '../../mappers/patient.mapper';

@injectable()
export class GetPatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<PatientResponseDto> {

    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    const treatmentCoursesData = await this.populateTreatmentCourses(patient.treatmentCourses);

    return patientToDto(patient, treatmentCoursesData);
  }

  async executeDetail(id: string, doctorId: string): Promise<PatientDetailResponseDto> {
    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    const [primaryClinicName, treatmentCoursesData, treatmentCoursesSummary] = await Promise.all([
      this.getPrimaryClinicName(patient.primaryClinic),
      this.populateTreatmentCourses(patient.treatmentCourses),
      this.calculateTreatmentCoursesSummary(patient.treatmentCourses)
    ]);

    return patientToDetailDto(patient, treatmentCoursesData, treatmentCoursesSummary, primaryClinicName);
  }

  private async getPrimaryClinicName(clinicId?: string): Promise<string | undefined> {
    if (!clinicId) {
      return undefined;
    }

    const clinic = await this.clinicRepository.findById(clinicId);
    return clinic?.name;
  }

  private async populateTreatmentCourses(treatmentCourseIds: string[]): Promise<Array<{ id: string; treatmentName: string }>> {
   
    if (!treatmentCourseIds || treatmentCourseIds.length === 0) {
      return [];
    }

    const treatmentCourses = await Promise.all(
      treatmentCourseIds.map(id => this.treatmentCourseRepository.findById(id))
    );

    const validCourses = treatmentCourses.filter(course => course !== null);

    const treatmentNamesMap = new Map<string, string>();
    const uniqueTreatmentIds = [...new Set(validCourses.map(course => course!.treatmentId))];

    await Promise.all(
      uniqueTreatmentIds.map(async (treatmentId) => {
        const treatment = await this.treatmentRepository.findById(treatmentId);
        if (treatment) {
          treatmentNamesMap.set(treatmentId, treatment.name);
        }
      })
    );

    return validCourses.map(course => ({
      id: course!.id,
      treatmentName: treatmentNamesMap.get(course!.treatmentId) || 'Unknown Treatment'
    }));
  }

  private async calculateTreatmentCoursesSummary(treatmentCourseIds: string[]): Promise<TreatmentCoursesSummaryDto> {
    if (!treatmentCourseIds || treatmentCourseIds.length === 0) {
      return {
        totalCost: 0,
        totalPaid: 0,
        totalRemaining: 0
      };
    }

    const treatmentCourses = await Promise.all(
      treatmentCourseIds.map(id => this.treatmentCourseRepository.findById(id))
    );

    const validCourses = treatmentCourses.filter(course => course !== null && !course.isDeleted);

    const totalCost = validCourses.reduce((sum, course) => sum + (course!.totalCost || 0), 0);
    const totalPaid = validCourses.reduce((sum, course) => sum + (course!.totalPaid || 0), 0);
    const totalRemaining = Math.max(0, totalCost - totalPaid);

    return {
      totalCost,
      totalPaid,
      totalRemaining
    };
  }
}



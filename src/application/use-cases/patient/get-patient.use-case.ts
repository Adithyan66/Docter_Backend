import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { PatientResponseDto } from '../../../presentation/dto/patient.dto';
import { patientToDto } from '../../mappers/patient.mapper';

@injectable()
export class GetPatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<PatientResponseDto> {

    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    const treatmentCoursesData = await this.populateTreatmentCourses(patient.treatmentCourses);

    return patientToDto(patient, treatmentCoursesData);
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
}



import { injectable, inject } from 'tsyringe';
import { IPatientRepository, PatientSearchOptions } from '../../../domain/repositories/patient.repository';
import { GetPatientsQueryDto, PaginatedPatientsResponseDto } from '../../../presentation/dto/patient.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { patientToDto } from '../../mappers/patient.mapper';

@injectable()
export class GetPatientsUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository
  ) {}

  async execute(doctorId: string, input: GetPatientsQueryDto): Promise<PaginatedPatientsResponseDto> {

    const page = input.page && input.page > 0 ? input.page : 1;
    
    const limit = input.limit && input.limit > 0 ? input.limit : 10;

    if (input.minAge !== undefined && input.minAge < 0) {
      throw new ValidationError('minAge cannot be negative');
    }
    if (input.maxAge !== undefined && input.maxAge < 0) {
      throw new ValidationError('maxAge cannot be negative');
    }
    if (input.minAge !== undefined && input.maxAge !== undefined && input.minAge > input.maxAge) {
      throw new ValidationError('minAge cannot be greater than maxAge');
    }

    const options: PatientSearchOptions = {
      doctorId,
      page,
      limit,
      search: input.search?.trim(),
      patientId: input.patientId?.trim(),
      clinicId: input.clinicId,
      gender: input.gender,
      consultationType: input.consultationType,
      minAge: input.minAge,
      maxAge: input.maxAge,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    const result = await this.patientRepository.findPaginated(options);

    return {
      patients: result.patients.map((patient) => 
        patientToDto(patient, undefined, result.clinicNames?.[patient.id])
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}



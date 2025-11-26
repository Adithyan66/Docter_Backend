import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { PatientResponseDto } from '../../../presentation/dto/patient.dto';
import { patientToDto } from '../../mappers/patient.mapper';

@injectable()
export class GetPatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }
    return patientToDto(patient);
  }
}



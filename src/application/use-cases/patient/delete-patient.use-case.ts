import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class DeletePatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }
    await this.patientRepository.delete(id);
  }
}



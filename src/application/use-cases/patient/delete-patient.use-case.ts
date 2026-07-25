import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { IPatientCascade } from '../../interfaces/patient-cascade.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IDeletePatientUseCase } from '../../interfaces/use-cases/patient/patient-use-cases.interface';

@injectable()
export class DeletePatientUseCase implements IDeletePatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IPatientCascade') private readonly cascade: IPatientCascade
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    if (patient.isDeleted) {
      throw new ValidationError('Patient is already deleted');
    }

    await this.cascade.softDelete(id, doctorId);
  }
}

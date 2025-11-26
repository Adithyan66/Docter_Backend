import { injectable, inject } from 'tsyringe';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { PrescriptionResponseDto } from '../../../presentation/dto/prescription.dto';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { prescriptionToDto } from '../../mappers/prescription.mapper';

@injectable()
export class GetPrescriptionUseCase {
  constructor(
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionRepository.findByIdAndDoctor(id, doctorId);
    if (!prescription) {
      throw new NotFoundError('Prescription', id);
    }

    return prescriptionToDto(prescription);
  }
}


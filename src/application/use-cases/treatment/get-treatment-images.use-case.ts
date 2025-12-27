import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository, GetTreatmentImagesOptions } from '../../../domain/repositories/treatment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IGetTreatmentImagesUseCase } from '../../interfaces/use-cases/treatment/treatment-use-cases.interface';

@injectable()
export class GetTreatmentImagesUseCase implements IGetTreatmentImagesUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(
    treatmentId: string,
    doctorId: string,
    options: { page?: number; limit?: number }
  ): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }> {
    const treatment = await this.treatmentRepository.findById(treatmentId);
    if (!treatment || treatment.doctorId !== doctorId) {
      throw new NotFoundError('Treatment', treatmentId);
    }

    const page = options.page && options.page >= 1 ? options.page : 1;
    const limit = options.limit && options.limit >= 1 && options.limit <= 100 ? options.limit : 25;

    const getOptions: GetTreatmentImagesOptions = {
      page,
      limit,
    };

    return await this.treatmentRepository.getTreatmentImages(treatmentId, getOptions);
  }
}

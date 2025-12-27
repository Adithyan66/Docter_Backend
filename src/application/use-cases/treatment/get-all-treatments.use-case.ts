import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository, FindAllPaginatedOptions } from '../../../domain/repositories/treatment.repository';
import { IGetAllTreatmentsUseCase } from '../../interfaces/use-cases/treatment/treatment-use-cases.interface';

@injectable()
export class GetAllTreatmentsUseCase implements IGetAllTreatmentsUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    sortBy?: 'averageAmount' | 'averageDuration' | 'numberOfPatients' | 'ongoing' | 'completed' | '',
    sortOrder?: 'asc' | 'desc',
    search?: string
  ): Promise<{ treatments: any[]; total: number; page: number; limit: number; totalPages: number }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const options: FindAllPaginatedOptions = {
      page,
      limit,
      sortBy: sortBy || '',
      sortOrder: sortOrder || 'desc',
      search: search?.trim() || undefined,
      doctorId,
    };

    return await this.treatmentRepository.findAllPaginated(options);
  }
}


import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository, TreatmentStatisticsOptions } from '../../../domain/repositories/treatment.repository';
import { Treatment } from '../../../domain/entities/treatment.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface GetTreatmentOptions {
  includeStatistics?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  clinicId?: string;
  include?: string[];
  exclude?: string[];
}

export interface GetTreatmentResult {
  treatment: Treatment;
  statistics?: any;
}

@injectable()
export class GetTreatmentUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(id: string, doctorId: string, options?: GetTreatmentOptions): Promise<GetTreatmentResult> {
    const treatment = await this.treatmentRepository.findById(id);
    if (!treatment || treatment.doctorId !== doctorId) {
      throw new NotFoundError('Treatment', id);
    }

    const result: GetTreatmentResult = { treatment };

    if (options?.includeStatistics) {
      const statsOptions: TreatmentStatisticsOptions = {
        doctorId,
        startDateFrom: options.startDateFrom,
        startDateTo: options.startDateTo,
        clinicId: options.clinicId,
      };

      let statistics = await this.treatmentRepository.getStatistics(id, statsOptions);

      if (options.include || options.exclude) {
        statistics = this.filterStatistics(statistics, options.include, options.exclude);
      }

      result.statistics = statistics;
    }

    return result;
  }

  private filterStatistics(statistics: any, include?: string[], exclude?: string[]): any {
    const filtered: any = { ...statistics };

    if (exclude && exclude.length > 0) {
      exclude.forEach((key) => {
        delete filtered[key];
      });
    }

    if (include && include.length > 0) {
      const allowedKeys = new Set(include);
      Object.keys(filtered).forEach((key) => {
        if (!allowedKeys.has(key)) {
          delete filtered[key];
        }
      });
    }

    return filtered;
  }
}


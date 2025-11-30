import { injectable, inject } from 'tsyringe';
import { IClinicRepository, ClinicStatisticsOptions } from '../../../domain/repositories/clinic.repository';
import { Clinic } from '../../../domain/entities/clinic.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface GetClinicOptions {
  includeStatistics?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  treatmentId?: string;
  include?: string[];
  exclude?: string[];
}

export interface GetClinicResult {
  clinic: Clinic;
  statistics?: any;
}

@injectable()
export class GetClinicUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string, options?: GetClinicOptions): Promise<GetClinicResult> {
    const clinic = await this.clinicRepository.findById(id);
    if (!clinic || clinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', id);
    }

    const result: GetClinicResult = { clinic };

    if (options?.includeStatistics) {
      const statsOptions: ClinicStatisticsOptions = {
        doctorId,
        startDateFrom: options.startDateFrom,
        startDateTo: options.startDateTo,
        treatmentId: options.treatmentId,
      };

      let statistics = await this.clinicRepository.getStatistics(id, statsOptions);

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


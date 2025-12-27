import { injectable, inject } from 'tsyringe';
import { IClinicRepository, ClinicStatisticsOptions } from '../../../domain/repositories/clinic.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';
import { IGetClinicUseCase, GetClinicOptions, GetClinicResult } from '../../interfaces/use-cases/clinic/clinic-use-cases.interface';

export { GetClinicOptions, GetClinicResult };

@injectable()
export class GetClinicUseCase implements IGetClinicUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(
    id: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string },
    options?: GetClinicOptions
  ): Promise<GetClinicResult> {
    const { doctorId, role, clinicId } = requester;
    const clinic = await this.clinicRepository.findById(id);
    if (!clinic || clinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', id);
    }
    if (role === 'staff') {
      if (!clinicId || clinicId !== clinic.id) {
        throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
      }
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


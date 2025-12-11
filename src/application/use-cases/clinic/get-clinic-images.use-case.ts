import { injectable, inject } from 'tsyringe';
import { IClinicRepository, GetClinicImagesOptions } from '../../../domain/repositories/clinic.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';

@injectable()
export class GetClinicImagesUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(
    clinicId: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string },
    options: { page?: number; limit?: number }
  ): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }> {
    const { doctorId, role, clinicId: staffClinicId } = requester;
    
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic || clinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', clinicId);
    }

    if (role === 'staff') {
      if (!staffClinicId || staffClinicId !== clinic.id) {
        throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
      }
    }

    const page = options.page && options.page >= 1 ? options.page : 1;
    const limit = options.limit && options.limit >= 1 && options.limit <= 100 ? options.limit : 25;

    const getOptions: GetClinicImagesOptions = {
      page,
      limit,
    };

    return await this.clinicRepository.getClinicImages(clinicId, getOptions);
  }
}

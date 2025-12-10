import { injectable, inject } from 'tsyringe';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { PaginatedStaffResponseDto } from '../../../presentation/dto/staff.dto';

export type GetAllStaffParams = {
  page?: number;
  limit?: number;
  username?: string;
  clinicId?: string;
  isActive?: boolean;
};

@injectable()
export class GetAllStaffUseCase {
  constructor(@inject('IStaffRepository') private readonly staffRepository: IStaffRepository) {}

  async execute(doctorId: string, params: GetAllStaffParams = {}): Promise<PaginatedStaffResponseDto> {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const limit = params.limit && params.limit >= 1 && params.limit <= 100 ? params.limit : 20;
    const username = params.username?.trim() || undefined;
    const clinicId = params.clinicId?.trim() || undefined;
    const isActive = params.isActive !== undefined ? params.isActive : undefined;

    const options = {
      doctorId,
      page,
      limit,
      username,
      clinicId,
      isActive,
    };

    const result = await this.staffRepository.findAllPaginated(options);

    return {
      staff: result.staff.map((staff) => ({
        id: staff.id,
        username: staff.username,
        clinicId: staff.clinicId,
        clinicName: (staff as any).clinicName,
        doctorId: staff.doctorId,
        role: staff.role,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}



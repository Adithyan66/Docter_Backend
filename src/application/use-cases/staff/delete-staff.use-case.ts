import { injectable, inject } from 'tsyringe';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteStaffUseCase } from '../../interfaces/use-cases/staff/staff-use-cases.interface';

@injectable()
export class DeleteStaffUseCase implements IDeleteStaffUseCase {
  constructor(@inject('IStaffRepository') private readonly staffRepository: IStaffRepository) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const staff = await this.staffRepository.findById(id);
    if (!staff || staff.doctorId !== doctorId) {
      throw new NotFoundError('Staff');
    }
    await this.staffRepository.update(id, { isActive: false, refreshToken: null });
  }
}



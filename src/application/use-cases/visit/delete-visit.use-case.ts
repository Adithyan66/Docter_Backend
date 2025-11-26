import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class DeleteVisitUseCase {
  constructor(@inject('IVisitRepository') private readonly visitRepository: IVisitRepository) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
    if (!visit) {
      throw new NotFoundError('Visit', id);
    }

    const deleted = await this.visitRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Visit', id);
    }
  }
}


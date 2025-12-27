import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { VisitResponseDto } from '../../../presentation/dto/visit.dto';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { visitToDto } from '../../mappers/visit.mapper';
import { IGetVisitUseCase } from '../../interfaces/use-cases/visit/visit-use-cases.interface';

@injectable()
export class GetVisitUseCase implements IGetVisitUseCase {
  constructor(@inject('IVisitRepository') private readonly visitRepository: IVisitRepository) {}

  async execute(id: string, doctorId: string): Promise<VisitResponseDto> {
    const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
    if (!visit) {
      throw new NotFoundError('Visit', id);
    }
    return visitToDto(visit);
  }
}


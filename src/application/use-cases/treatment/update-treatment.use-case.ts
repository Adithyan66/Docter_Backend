import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';

interface UpdateTreatmentInput {
  name?: string;
  description?: string;
  minDuration?: number;
  maxDuration?: number;
  avgDuration?: number;
  minFees?: number;
  maxFees?: number;
  avgFees?: number;
  steps?: string[];
  aftercare?: string[];
  followUpRequired?: boolean;
  followUpAfterDays?: number;
  risks?: string[];
  images?: string[];
  isOneTime?: boolean;
  regularVisitInterval?: { interval: number; unit: string } | null;
}

@injectable()
export class UpdateTreatmentUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateTreatmentInput): Promise<void> {
    const existingTreatment = await this.treatmentRepository.findById(id);
    if (!existingTreatment || existingTreatment.doctorId !== doctorId) {
      throw new NotFoundError('Treatment', id);
    }

    const trimmedInput = {
      ...input,
      name: input.name !== undefined ? input.name.trim() : undefined,
    };
    this.validateInput(trimmedInput, existingTreatment);
    this.validateVisitType(trimmedInput, existingTreatment);

    if (trimmedInput.name !== undefined && trimmedInput.name !== existingTreatment.name) {
      const treatmentWithSameName = await this.treatmentRepository.findByName(trimmedInput.name, doctorId);
      if (treatmentWithSameName) {
        throw new ConflictError(`Treatment with name "${trimmedInput.name}" already exists`);
      }
    }

    const updateData: Partial<typeof existingTreatment> = {};
    if (trimmedInput.name !== undefined) updateData.name = trimmedInput.name;
    if (trimmedInput.description !== undefined) updateData.description = trimmedInput.description;
    if (trimmedInput.minDuration !== undefined) updateData.minDuration = trimmedInput.minDuration;
    if (trimmedInput.maxDuration !== undefined) updateData.maxDuration = trimmedInput.maxDuration;
    if (trimmedInput.avgDuration !== undefined) updateData.avgDuration = trimmedInput.avgDuration;
    if (trimmedInput.minFees !== undefined) updateData.minFees = trimmedInput.minFees;
    if (trimmedInput.maxFees !== undefined) updateData.maxFees = trimmedInput.maxFees;
    if (trimmedInput.avgFees !== undefined) updateData.avgFees = trimmedInput.avgFees;
    if (trimmedInput.steps !== undefined) updateData.steps = trimmedInput.steps;
    if (trimmedInput.aftercare !== undefined) updateData.aftercare = trimmedInput.aftercare;
    if (trimmedInput.followUpRequired !== undefined) updateData.followUpRequired = trimmedInput.followUpRequired;
    if (trimmedInput.followUpAfterDays !== undefined) updateData.followUpAfterDays = trimmedInput.followUpAfterDays;
    if (trimmedInput.risks !== undefined) updateData.risks = trimmedInput.risks;
    if (trimmedInput.images !== undefined) updateData.images = trimmedInput.images;
    if (trimmedInput.isOneTime !== undefined) updateData.isOneTime = trimmedInput.isOneTime;
    if (trimmedInput.regularVisitInterval !== undefined) {
      updateData.regularVisitInterval = trimmedInput.regularVisitInterval;
    }

    const updated = await this.treatmentRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Treatment', id);
    }
  }

  private validateInput(input: UpdateTreatmentInput, existingTreatment: any): void {
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }

    const minDuration = input.minDuration !== undefined ? input.minDuration : existingTreatment.minDuration;
    const maxDuration = input.maxDuration !== undefined ? input.maxDuration : existingTreatment.maxDuration;
    const avgDuration = input.avgDuration !== undefined ? input.avgDuration : existingTreatment.avgDuration;

    if (minDuration !== undefined && maxDuration !== undefined) {
      if (minDuration > maxDuration) {
        throw new ValidationError('minDuration must be less than or equal to maxDuration');
      }
    }

    if (avgDuration !== undefined) {
      if (minDuration !== undefined && avgDuration < minDuration) {
        throw new ValidationError('avgDuration must be greater than or equal to minDuration');
      }
      if (maxDuration !== undefined && avgDuration > maxDuration) {
        throw new ValidationError('avgDuration must be less than or equal to maxDuration');
      }
    }

    const minFees = input.minFees !== undefined ? input.minFees : existingTreatment.minFees;
    const maxFees = input.maxFees !== undefined ? input.maxFees : existingTreatment.maxFees;
    const avgFees = input.avgFees !== undefined ? input.avgFees : existingTreatment.avgFees;

    if (minFees !== undefined && maxFees !== undefined) {
      if (minFees > maxFees) {
        throw new ValidationError('minFees must be less than or equal to maxFees');
      }
    }

    if (avgFees !== undefined) {
      if (minFees !== undefined && avgFees < minFees) {
        throw new ValidationError('avgFees must be greater than or equal to minFees');
      }
      if (maxFees !== undefined && avgFees > maxFees) {
        throw new ValidationError('avgFees must be less than or equal to maxFees');
      }
    }
  }

  private validateVisitType(input: UpdateTreatmentInput, existingTreatment: any): void {
    const isOneTime = input.isOneTime !== undefined ? input.isOneTime : existingTreatment.isOneTime;
    const regularVisitInterval = input.regularVisitInterval !== undefined ? input.regularVisitInterval : existingTreatment.regularVisitInterval;

    if (isOneTime === true && regularVisitInterval !== undefined && regularVisitInterval !== null) {
      throw new ValidationError('Cannot set regularVisitInterval when isOneTime is true');
    }
    if (regularVisitInterval !== undefined && regularVisitInterval !== null) {
      if (regularVisitInterval.interval <= 0) {
        throw new ValidationError('regularVisitInterval.interval must be a positive number');
      }
      if (!regularVisitInterval.unit || regularVisitInterval.unit.trim().length === 0) {
        throw new ValidationError('regularVisitInterval.unit is required');
      }
    }
  }
}


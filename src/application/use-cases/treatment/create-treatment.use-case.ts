import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { Treatment } from '../../../domain/entities/treatment.entity';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';

interface CreateTreatmentInput {
  name: string;
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
  regularVisitInterval?: { interval: number; unit: string };
}

@injectable()
export class CreateTreatmentUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(doctorId: string, input: CreateTreatmentInput): Promise<void> {
    const trimmedInput = {
      ...input,
      name: input.name.trim(),
    };
    this.validateInput(trimmedInput);
    this.validateVisitType(trimmedInput);

    const existingTreatment = await this.treatmentRepository.findByName(trimmedInput.name, doctorId);
    if (existingTreatment) {
      throw new ConflictError(`Treatment with name "${trimmedInput.name}" already exists`);
    }

    const treatment = new Treatment(
      '',
      doctorId,
      trimmedInput.name,
      undefined,
      undefined,
      trimmedInput.description,
      trimmedInput.minDuration,
      trimmedInput.maxDuration,
      trimmedInput.avgDuration,
      trimmedInput.minFees,
      trimmedInput.maxFees,
      trimmedInput.avgFees,
      trimmedInput.steps,
      trimmedInput.aftercare,
      trimmedInput.followUpRequired,
      trimmedInput.followUpAfterDays,
      trimmedInput.risks,
      trimmedInput.images,
      trimmedInput.isOneTime,
      trimmedInput.regularVisitInterval
    );

    await this.treatmentRepository.create(treatment);
  }

  private validateInput(input: CreateTreatmentInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    const MIN_DURATION_MONTHS = 0;
    const MAX_DURATION_MONTHS = 120;
    const MIN_FEES = 0;
    const MAX_FEES = 1000000;

    if (input.minDuration !== undefined) {
      if (input.minDuration < MIN_DURATION_MONTHS || input.minDuration > MAX_DURATION_MONTHS) {
        throw new ValidationError(`minDuration must be between ${MIN_DURATION_MONTHS} and ${MAX_DURATION_MONTHS} months`);
      }
    }

    if (input.maxDuration !== undefined) {
      if (input.maxDuration < MIN_DURATION_MONTHS || input.maxDuration > MAX_DURATION_MONTHS) {
        throw new ValidationError(`maxDuration must be between ${MIN_DURATION_MONTHS} and ${MAX_DURATION_MONTHS} months`);
      }
    }

    if (input.avgDuration !== undefined) {
      if (input.avgDuration < MIN_DURATION_MONTHS || input.avgDuration > MAX_DURATION_MONTHS) {
        throw new ValidationError(`avgDuration must be between ${MIN_DURATION_MONTHS} and ${MAX_DURATION_MONTHS} months`);
      }
    }

    if (input.minDuration !== undefined && input.maxDuration !== undefined) {
      if (input.minDuration > input.maxDuration) {
        throw new ValidationError('minDuration must be less than or equal to maxDuration');
      }
    }

    if (input.minFees !== undefined) {
      if (input.minFees < MIN_FEES) {
        throw new ValidationError(`minFees must be at least ${MIN_FEES}`);
      }
      if (input.minFees > MAX_FEES) {
        throw new ValidationError(`minFees must not exceed ${MAX_FEES} (10 lakh)`);
      }
    }

    if (input.maxFees !== undefined) {
      if (input.maxFees < MIN_FEES) {
        throw new ValidationError(`maxFees must be at least ${MIN_FEES}`);
      }
      if (input.maxFees > MAX_FEES) {
        throw new ValidationError(`maxFees must not exceed ${MAX_FEES} (10 lakh)`);
      }
    }

    if (input.minFees !== undefined && input.maxFees !== undefined) {
      if (input.minFees > input.maxFees) {
        throw new ValidationError('minFees must be less than or equal to maxFees');
      }
    }

    if (input.avgDuration !== undefined) {
      if (input.minDuration !== undefined && input.avgDuration < input.minDuration) {
        throw new ValidationError('avgDuration must be greater than or equal to minDuration');
      }
      if (input.maxDuration !== undefined && input.avgDuration > input.maxDuration) {
        throw new ValidationError('avgDuration must be less than or equal to maxDuration');
      }
    }

    if (input.avgFees !== undefined) {
      if (input.avgFees < MIN_FEES) {
        throw new ValidationError(`avgFees must be at least ${MIN_FEES}`);
      }
      if (input.avgFees > MAX_FEES) {
        throw new ValidationError(`avgFees must not exceed ${MAX_FEES} (10 lakh)`);
      }
      if (input.minFees !== undefined && input.avgFees < input.minFees) {
        throw new ValidationError('avgFees must be greater than or equal to minFees');
      }
      if (input.maxFees !== undefined && input.avgFees > input.maxFees) {
        throw new ValidationError('avgFees must be less than or equal to maxFees');
      }
    }
  }

  private validateVisitType(input: CreateTreatmentInput): void {
    if (input.isOneTime === true && input.regularVisitInterval !== undefined && input.regularVisitInterval !== null) {
      throw new ValidationError('Cannot set regularVisitInterval when isOneTime is true');
    }
    if (input.regularVisitInterval !== undefined && input.regularVisitInterval !== null) {
      if (input.regularVisitInterval.interval <= 0) {
        throw new ValidationError('regularVisitInterval.interval must be a positive number');
      }
      if (!input.regularVisitInterval.unit || input.regularVisitInterval.unit.trim().length === 0) {
        throw new ValidationError('regularVisitInterval.unit is required');
      }
    }
  }
}


import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Clinic } from '../../../domain/entities/clinic.entity';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { Email } from '../../../domain/value-objects/email.vo';
import { WorkingDay, DayOfWeek } from '../../../domain/value-objects/working-day.vo';

interface CreateClinicInput {
  clinicId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationUrl?: string;
  workingDays?: Array<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  }>;
  treatments?: string[];
  notes?: string;
  isActive?: boolean;
}

@injectable()
export class CreateClinicUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(doctorId: string, input: CreateClinicInput): Promise<void> {
    const trimmedInput = {
      ...input,
      clinicId: input.clinicId.trim().toUpperCase(),
      name: input.name.trim(),
      address: input.address?.trim(),
      city: input.city?.trim(),
      state: input.state?.trim(),
      pincode: input.pincode?.trim(),
      phone: input.phone?.trim(),
      website: input.website?.trim(),
      locationUrl: input.locationUrl?.trim(),
      notes: input.notes?.trim(),
    };

    this.validateInput(trimmedInput);

    const existingClinicByName = await this.clinicRepository.findByName(trimmedInput.name, doctorId);
    if (existingClinicByName) {
      throw new ConflictError(`Clinic with name "${trimmedInput.name}" already exists`);
    }

    const existingClinicById = await this.clinicRepository.findByClinicId(trimmedInput.clinicId, doctorId);
    if (existingClinicById) {
      throw new ConflictError(`Clinic with clinicId "${trimmedInput.clinicId}" already exists`);
    }

    let email: Email | undefined;
    if (trimmedInput.email) {
      email = new Email(trimmedInput.email);
    }

    let workingDays: WorkingDay[] | undefined;
    if (trimmedInput.workingDays && trimmedInput.workingDays.length > 0) {
      workingDays = trimmedInput.workingDays.map(wd => new WorkingDay(wd.day, wd.startTime, wd.endTime));
    }

    const clinic = new Clinic(
      '',
      trimmedInput.clinicId,
      doctorId,
      trimmedInput.name,
      undefined,
      undefined,
      trimmedInput.address,
      trimmedInput.city,
      trimmedInput.state,
      trimmedInput.pincode,
      trimmedInput.phone,
      email,
      trimmedInput.website,
      trimmedInput.locationUrl,
      workingDays,
      trimmedInput.treatments,
      undefined,
      undefined,
      trimmedInput.notes,
      trimmedInput.isActive
    );

    await this.clinicRepository.create(clinic);
  }

  private validateInput(input: CreateClinicInput): void {
    if (!input.clinicId || input.clinicId.trim().length === 0) {
      throw new ValidationError('clinicId is required');
    }

    const clinicIdRegex = /^[A-Z]{3}$/;
    if (!clinicIdRegex.test(input.clinicId.trim().toUpperCase())) {
      throw new ValidationError('clinicId must be exactly 3 capital letters');
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    if (input.email) {
      try {
        new Email(input.email);
      } catch (error) {
        throw new ValidationError('Invalid email format');
      }
    }

    if (input.workingDays && input.workingDays.length > 0) {
      input.workingDays.forEach((wd, index) => {
        try {
          new WorkingDay(wd.day, wd.startTime, wd.endTime);
        } catch (error: any) {
          throw new ValidationError(`Invalid working day at index ${index}: ${error.message}`);
        }
      });
    }
  }
}


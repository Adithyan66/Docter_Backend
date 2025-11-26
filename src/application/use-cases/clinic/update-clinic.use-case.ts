import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { Email } from '../../../domain/value-objects/email.vo';
import { WorkingDay, DayOfWeek } from '../../../domain/value-objects/working-day.vo';

interface UpdateClinicInput {
  name?: string;
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
  images?: string[];
  notes?: string;
  isActive?: boolean;
}

@injectable()
export class UpdateClinicUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateClinicInput): Promise<void> {
    const existingClinic = await this.clinicRepository.findById(id);
    if (!existingClinic || existingClinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', id);
    }

    if ('clinicId' in input && input.clinicId !== undefined) {
      throw new ValidationError('clinicId cannot be updated');
    }

    const trimmedInput = {
      ...input,
      name: input.name !== undefined ? input.name.trim() : undefined,
      address: input.address !== undefined ? input.address.trim() : undefined,
      city: input.city !== undefined ? input.city.trim() : undefined,
      state: input.state !== undefined ? input.state.trim() : undefined,
      pincode: input.pincode !== undefined ? input.pincode.trim() : undefined,
      phone: input.phone !== undefined ? input.phone.trim() : undefined,
      website: input.website !== undefined ? input.website.trim() : undefined,
      locationUrl: input.locationUrl !== undefined ? input.locationUrl.trim() : undefined,
      notes: input.notes !== undefined ? input.notes.trim() : undefined,
    };

    this.validateInput(trimmedInput, existingClinic);

    if (trimmedInput.name !== undefined && trimmedInput.name !== existingClinic.name) {
      const clinicWithSameName = await this.clinicRepository.findByName(trimmedInput.name, doctorId);
      if (clinicWithSameName) {
        throw new ConflictError(`Clinic with name "${trimmedInput.name}" already exists`);
      }
    }

    const updateData: any = {};
    if (trimmedInput.name !== undefined) updateData.name = trimmedInput.name;
    if (trimmedInput.address !== undefined) updateData.address = trimmedInput.address;
    if (trimmedInput.city !== undefined) updateData.city = trimmedInput.city;
    if (trimmedInput.state !== undefined) updateData.state = trimmedInput.state;
    if (trimmedInput.pincode !== undefined) updateData.pincode = trimmedInput.pincode;
    if (trimmedInput.phone !== undefined) updateData.phone = trimmedInput.phone;
    if (trimmedInput.email !== undefined) {
      updateData.email = trimmedInput.email ? new Email(trimmedInput.email) : undefined;
    }
    if (trimmedInput.website !== undefined) updateData.website = trimmedInput.website;
    if (trimmedInput.locationUrl !== undefined) updateData.locationUrl = trimmedInput.locationUrl;
    if (trimmedInput.workingDays !== undefined) {
      updateData.workingDays = trimmedInput.workingDays.length > 0
        ? trimmedInput.workingDays.map(wd => new WorkingDay(wd.day, wd.startTime, wd.endTime))
        : undefined;
    }
    if (trimmedInput.treatments !== undefined) updateData.treatments = trimmedInput.treatments;
    if (trimmedInput.images !== undefined) updateData.images = trimmedInput.images;
    if (trimmedInput.notes !== undefined) updateData.notes = trimmedInput.notes;
    if (trimmedInput.isActive !== undefined) updateData.isActive = trimmedInput.isActive;

    const updated = await this.clinicRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Clinic', id);
    }
  }

  private validateInput(input: UpdateClinicInput, existingClinic: any): void {
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }

    if (input.email !== undefined && input.email) {
      try {
        new Email(input.email);
      } catch (error) {
        throw new ValidationError('Invalid email format');
      }
    }

    if (input.workingDays !== undefined && input.workingDays.length > 0) {
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


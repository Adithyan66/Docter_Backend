import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { UpdatePatientRequestDto, PatientResponseDto } from '../../../presentation/dto/patient.dto';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { Email } from '../../../domain/value-objects/email.vo';
import { Phone } from '../../../domain/value-objects/phone.vo';
import { PatientId } from '../../../domain/value-objects/patient-id.vo';
import { Patient } from '../../../domain/entities/patient.entity';
import { patientToDto } from '../../mappers/patient.mapper';
import { IUpdatePatientUseCase } from '../../interfaces/use-cases/patient/patient-use-cases.interface';
import { IFileStorageService } from '../../interfaces/file-storage-service.interface';

@injectable()
export class UpdatePatientUseCase implements IUpdatePatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IFileStorageService') private readonly fileStorageService: IFileStorageService
  ) {}

  async execute(id: string, doctorId: string, input: UpdatePatientRequestDto): Promise<PatientResponseDto> {
    if (!input || Object.keys(input).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    const updateData: Partial<Patient> = {};
    let hasChanges = false;
    const oldProfilePicUrl = patient.profilePicUrl;

    if (input.firstName !== undefined || input.lastName !== undefined) {
      const firstName = input.firstName !== undefined ? input.firstName.trim() : patient.firstName;
      const lastName = input.lastName !== undefined ? input.lastName.trim() : patient.lastName;
      patient.updateNames(firstName, lastName);
      updateData.firstName = patient.firstName;
      updateData.lastName = patient.lastName;
      updateData.fullName = patient.fullName;
      hasChanges = true;
    }

    if ('dob' in input) {
      const dob = this.parseDate(input.dob, 'dob');
      patient.setDob(dob);
      updateData.dob = patient.dob;
      updateData.age = patient.age;
      hasChanges = true;
    }

    if (input.age !== undefined && !('dob' in input)) {
      if (input.age < 0) {
        throw new ValidationError('age cannot be negative');
      }
      patient.age = input.age;
      updateData.age = input.age;
      hasChanges = true;
    }

    if (input.gender !== undefined) {
      patient.gender = input.gender;
      updateData.gender = input.gender;
      hasChanges = true;
    }

    if ('phone' in input) {
      const phone = this.buildPhone(input.phone);
      patient.setPhone(phone);
      updateData.phone = phone;
      hasChanges = true;
    }

    if ('email' in input) {
      const email = this.buildEmail(input.email);
      patient.setEmail(email);
      updateData.email = email;
      hasChanges = true;
    }

    if (input.address !== undefined) {
      patient.address = input.address ? input.address.trim() : undefined;
      updateData.address = patient.address;
      hasChanges = true;
    }

    if (input.profilePicUrl !== undefined) {
      const newProfilePicUrl = input.profilePicUrl === null || input.profilePicUrl === '' 
        ? null 
        : input.profilePicUrl.trim();
      const profilePicChanged = oldProfilePicUrl !== newProfilePicUrl;

      if (profilePicChanged && oldProfilePicUrl) {
        try {
          const fileKey = this.fileStorageService.extractKeyFromUrl(oldProfilePicUrl);
          await this.fileStorageService.deleteFile(fileKey);
        } catch (error) {
          console.error(`Failed to delete old profile picture from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      patient.profilePicUrl = newProfilePicUrl || undefined;
      (updateData as any).profilePicUrl = newProfilePicUrl;
      hasChanges = true;
    }

    if (input.consultationType !== undefined) {
      patient.setConsultationType(input.consultationType);
      updateData.consultationType = patient.consultationType;
      hasChanges = true;
    }

    if (input.primaryClinic !== undefined) {
      patient.primaryClinic = input.primaryClinic;
      updateData.primaryClinic = patient.primaryClinic;
      hasChanges = true;
    }

    if (input.clinics !== undefined) {
      patient.clinics = this.normalizeStrings(input.clinics);
      updateData.clinics = patient.clinics;
      hasChanges = true;
    }

    if (input.tags !== undefined) {
      patient.tags = this.normalizeStrings(input.tags);
      updateData.tags = patient.tags;
      hasChanges = true;
    }

    if (input.visitCount !== undefined) {
      if (input.visitCount < 0) {
        throw new ValidationError('visitCount cannot be negative');
      }
      patient.visitCount = input.visitCount;
      updateData.visitCount = patient.visitCount;
      hasChanges = true;
    }

    if ('lastVisitAt' in input) {
      const lastVisit = this.parseDate(input.lastVisitAt, 'lastVisitAt');
      patient.lastVisitAt = lastVisit;
      updateData.lastVisitAt = lastVisit;
      hasChanges = true;
    }

    if (input.isActive !== undefined) {
      patient.isActive = input.isActive;
      updateData.isActive = input.isActive;
      hasChanges = true;
    }

    if (input.isDeleted !== undefined) {
      patient.isDeleted = input.isDeleted;
      updateData.isDeleted = input.isDeleted;
      hasChanges = true;
    }

    if (input.defaultTreatmentCourse !== undefined) {
      try {
        patient.setDefaultTreatmentCourse(input.defaultTreatmentCourse);
        updateData.treatmentCourses = patient.treatmentCourses;
        hasChanges = true;
      } catch (error: any) {
        throw new ValidationError(error.message);
      }
    }

    if (!hasChanges) {
      return patientToDto(patient);
    }

    const updated = await this.patientRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Patient', id);
    }
    return patientToDto(updated);
  }

  private async ensurePatientId(patientId?: string, currentId?: string): Promise<PatientId | undefined> {
    if (!patientId || patientId.trim().length === 0) {
      return undefined;
    }
    let value: PatientId;
    try {
      value = new PatientId(patientId);
    } catch (error: any) {
      throw new ValidationError(error.message);
    }
    const existing = await this.patientRepository.findByPatientId(value.toString());
    if (existing && existing.id !== currentId) {
      throw new ConflictError(`Patient with patientId "${value.toString()}" already exists`);
    }
    return value;
  }

  private buildEmail(email?: string): Email | undefined {
    if (!email || email.trim().length === 0) {
      return undefined;
    }
    try {
      return new Email(email.trim());
    } catch (error: any) {
      throw new ValidationError(error.message);
    }
  }

  private buildPhone(phone?: string): Phone | undefined {
    if (!phone || phone.trim().length === 0) {
      return undefined;
    }
    try {
      return new Phone(phone);
    } catch (error: any) {
      throw new ValidationError(error.message);
    }
  }

  private parseDate(value?: string, field?: string): Date | undefined {
    if (!value) {
      return undefined;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid ${field || 'date'} value`);
    }
    return date;
  }

  private normalizeStrings(values?: string[]): string[] {
    if (!values || values.length === 0) {
      return [];
    }
    const normalized = values
      .map((value) => (value ? value.trim() : ''))
      .filter((value) => value.length > 0);
    return Array.from(new Set(normalized));
  }
}



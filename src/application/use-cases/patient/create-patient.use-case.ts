import { injectable, inject } from 'tsyringe';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { CreatePatientRequestDto, PatientResponseDto } from '../../../presentation/dto/patient.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { Email } from '../../../domain/value-objects/email.vo';
import { Phone } from '../../../domain/value-objects/phone.vo';
import { PatientId } from '../../../domain/value-objects/patient-id.vo';
import { Patient } from '../../../domain/entities/patient.entity';
import { patientToDto } from '../../mappers/patient.mapper';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPatientIdCounterRepository } from '../../../domain/repositories/patient-id-counter.repository';
import { ICreatePatientUseCase } from '../../interfaces/use-cases/patient/patient-use-cases.interface';

@injectable()
export class CreatePatientUseCase implements ICreatePatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository,
    @inject('IPatientIdCounterRepository') private readonly patientIdCounterRepository: IPatientIdCounterRepository
  ) {}

  async execute(doctorId: string, input: CreatePatientRequestDto): Promise<PatientResponseDto> {
    this.validateInput(input);

    const clinicInfo = await this.resolvePrimaryClinic(doctorId, input.primaryClinic);
    const generatedPatientId = await this.generatePatientId(clinicInfo.clinicCode);

    const email = this.buildEmail(input.email);
    const phone = this.buildPhone(input.phone);
    const dob = this.parseDate(input.dob, 'dob');
    const lastVisitAt = this.parseDate(input.lastVisitAt, 'lastVisitAt');
    const clinics = this.buildClinicsList(clinicInfo.primaryClinicId, input.clinics);
    const tags = this.normalizeStrings(input.tags);

    const patient = new Patient(
      '',
      doctorId,
      input.firstName.trim(),
      input.consultationType,
      undefined,
      undefined,
      clinicInfo.primaryClinicId,
      clinics,
      generatedPatientId,
      input.lastName ? input.lastName.trim() : undefined,
      input.fullName ? input.fullName.trim() : undefined,
      dob,
      input.age,
      input.gender,
      phone,
      email,
      input.address ? input.address.trim() : undefined,
      input.profilePicUrl ? input.profilePicUrl.trim() : undefined,
      tags,
      [],
      input.visitCount ?? 0,
      lastVisitAt,
      input.isActive,
      false
    );

    const created = await this.patientRepository.create(patient);
    return patientToDto(created);
  }

  private validateInput(input: CreatePatientRequestDto): void {
    if (!input.firstName || input.firstName.trim().length === 0) {
      throw new ValidationError('firstName is required');
    }
    if (!input.consultationType) {
      throw new ValidationError('consultationType is required');
    }
    if (!input.primaryClinic || input.primaryClinic.trim().length === 0) {
      throw new ValidationError('primaryClinic is required');
    }
    if (input.age !== undefined && input.age < 0) {
      throw new ValidationError('age cannot be negative');
    }
    if (input.visitCount !== undefined && input.visitCount < 0) {
      throw new ValidationError('visitCount cannot be negative');
    }
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

  private async resolvePrimaryClinic(doctorId: string, primaryClinicId: string): Promise<{ primaryClinicId: string; clinicCode: string }> {
    const clinic = await this.clinicRepository.findById(primaryClinicId);
    if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
      throw new ValidationError('primaryClinic is invalid');
    }
    const clinicCode = clinic.clinicId?.trim().toUpperCase();
    if (!clinicCode || clinicCode.length !== 3) {
      throw new ValidationError('Clinic is missing a valid clinicId');
    }
    return { primaryClinicId, clinicCode };
  }

  private async generatePatientId(clinicCode: string): Promise<PatientId> {
    const sequence = await this.patientIdCounterRepository.getNextSequence(clinicCode);
    return new PatientId(`${clinicCode}-${sequence}`);
  }

  private buildClinicsList(primaryClinicId: string, clinics?: string[]): string[] {
    const sanitized = this.normalizeStrings(clinics);
    const trimmedPrimary = primaryClinicId.trim();
    if (!sanitized.includes(trimmedPrimary)) {
      sanitized.unshift(trimmedPrimary);
    }
    return sanitized;
  }
}



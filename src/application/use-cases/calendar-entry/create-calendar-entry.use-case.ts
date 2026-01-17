import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { CalendarEntry } from '../../../domain/entities/calendar-entry.entity';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ICreateCalendarEntryUseCase, CreateCalendarEntryInput } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class CreateCalendarEntryUseCase implements ICreateCalendarEntryUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository,
    @inject('IClinicRepository') private clinicRepository: IClinicRepository,
    @inject('IPatientRepository') private patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(doctorId: string, input: CreateCalendarEntryInput): Promise<void> {
    this.validateInput(input);

    const entryDate = new Date(input.date);
    this.validatePastDate(entryDate);

    console.log('doctorId', doctorId);
    console.log('input', input);

    const clinicExists = await this.clinicRepository.existsByClinicIdAndDoctorId(input.clinicId, doctorId);

    if (!clinicExists) {
      throw new NotFoundError('Clinic', input.clinicId);
    }

    const existingEntriesOnDate = await this.calendarEntryRepository.findByDate(entryDate, doctorId);
    
    const sameClinicEntry = existingEntriesOnDate.find(entry => entry.clinicId === input.clinicId);
    if (sameClinicEntry) {
      throw new ConflictError('Same clinic cannot be added multiple times on the same date');
    }

    const overlappingEntries = await this.calendarEntryRepository.findOverlappingEntries(
      entryDate,
      doctorId,
      input.startTime,
      input.endTime
    );

    if (overlappingEntries.length > 0) {
      throw new ConflictError('Clinic visit time overlaps with existing calendar entry on the same date');
    }

    const appointments = (input.appointments || []).map((apt) => ({
      patientId: apt.patientId,
      treatmentId: apt.treatmentId,
      startTime: apt.startTime,
      endTime: apt.endTime,
      notes: apt.notes,
      completed: apt.completed !== undefined ? apt.completed : false,
    }));

    const calendarEntry = new CalendarEntry(
      '',
      doctorId,
      entryDate,
      input.clinicId,
      input.startTime,
      input.endTime,
      appointments,
      undefined,
      undefined,
      input.notes
    );

    await this.calendarEntryRepository.create(calendarEntry);
  }

  private validateInput(input: CreateCalendarEntryInput): void {
    if (!input.date || input.date.trim().length === 0) {
      throw new ValidationError('Date is required');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(input.date)) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD format');
    }

    if (!input.clinicId || input.clinicId.trim().length === 0) {
      throw new ValidationError('clinicId is required');
    }

    if (!input.startTime || input.startTime.trim().length === 0) {
      throw new ValidationError('startTime is required');
    }

    if (!input.endTime || input.endTime.trim().length === 0) {
      throw new ValidationError('endTime is required');
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(input.startTime)) {
      throw new ValidationError('Invalid startTime format. Use HH:mm format');
    }

    if (!timeRegex.test(input.endTime)) {
      throw new ValidationError('Invalid endTime format. Use HH:mm format');
    }

    if (input.endTime <= input.startTime) {
      throw new ValidationError('endTime must be after startTime');
    }
  }

  private validatePastDate(date: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate < today) {
      throw new ValidationError('Cannot create calendar entry for past dates');
    }
  }

  private async validateAppointments(
    appointments: Array<{ patientId: string; treatmentId?: string; startTime?: string; endTime?: string }>,
    doctorId: string,
    clinicStartTime: string,
    clinicEndTime: string
  ): Promise<void> {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

    for (let i = 0; i < appointments.length; i++) {
      const apt = appointments[i];

      if (!apt.patientId || apt.patientId.trim().length === 0) {
        throw new ValidationError(`patientId is required for appointment at index ${i}`);
      }

      const patient = await this.patientRepository.findByIdAndDoctor(apt.patientId, doctorId);
      if (!patient) {
        throw new NotFoundError('Patient', apt.patientId);
      }

      if (apt.treatmentId) {
        if (apt.treatmentId.trim().length === 0) {
          throw new ValidationError(`treatmentId cannot be empty for appointment at index ${i}`);
        }
        const treatment = await this.treatmentRepository.findById(apt.treatmentId);
        if (!treatment || treatment.doctorId !== doctorId) {
          throw new NotFoundError('Treatment', apt.treatmentId);
        }
      }

      if (apt.startTime || apt.endTime) {
        if (!apt.startTime || apt.startTime.trim().length === 0) {
          throw new ValidationError(`startTime is required when endTime is provided for appointment at index ${i}`);
        }

        if (!apt.endTime || apt.endTime.trim().length === 0) {
          throw new ValidationError(`endTime is required when startTime is provided for appointment at index ${i}`);
        }

        if (!timeRegex.test(apt.startTime)) {
          throw new ValidationError(`Invalid startTime format for appointment at index ${i}. Use HH:mm format`);
        }

        if (!timeRegex.test(apt.endTime)) {
          throw new ValidationError(`Invalid endTime format for appointment at index ${i}. Use HH:mm format`);
        }

        if (apt.endTime <= apt.startTime) {
          throw new ValidationError(`endTime must be after startTime for appointment at index ${i}`);
        }

        if (apt.startTime < clinicStartTime || apt.endTime > clinicEndTime) {
          throw new ValidationError(`Appointment at index ${i} must be within clinic hours (${clinicStartTime} - ${clinicEndTime})`);
        }
      }
    }

    for (let i = 0; i < appointments.length; i++) {
      for (let j = i + 1; j < appointments.length; j++) {
        const apt1 = appointments[i];
        const apt2 = appointments[j];

        if (apt1.startTime && apt1.endTime && apt2.startTime && apt2.endTime) {
          if (apt1.startTime < apt2.endTime && apt1.endTime > apt2.startTime) {
            throw new ConflictError(`Appointments at indices ${i} and ${j} overlap`);
          }
        }
      }
    }
  }
}


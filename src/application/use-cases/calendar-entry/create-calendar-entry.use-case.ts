import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { CalendarEntry } from '../../../domain/entities/calendar-entry.entity';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import {
  ICreateCalendarEntryUseCase,
  CreateCalendarEntryInput,
} from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import {
  DATE_REGEX,
  TIME_REGEX,
  assertAppointmentsResolvable,
  assertNotPastDate,
} from './appointment-validation.util';

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
    assertNotPastDate(input.date, 'create');

    const clinicExists = await this.clinicRepository.existsByClinicIdAndDoctorId(
      input.clinicId,
      doctorId
    );
    if (!clinicExists) {
      throw new NotFoundError('Clinic', input.clinicId);
    }

    const existingEntriesOnDate = await this.calendarEntryRepository.findByDate(input.date, doctorId);
    if (existingEntriesOnDate.some((entry) => entry.clinicId === input.clinicId)) {
      throw new ConflictError('Same clinic cannot be added multiple times on the same date');
    }

    const overlappingEntries = await this.calendarEntryRepository.findOverlappingEntries(
      input.date,
      doctorId,
      input.startTime,
      input.endTime
    );
    if (overlappingEntries.length > 0) {
      throw new ConflictError(
        'Clinic visit time overlaps with existing calendar entry on the same date'
      );
    }

    const inputAppointments = input.appointments || [];
    await assertAppointmentsResolvable(
      inputAppointments,
      doctorId,
      input.startTime,
      input.endTime,
      this.patientRepository,
      this.treatmentRepository
    );

    const appointments = inputAppointments.map((apt) => ({
      patientId: apt.patientId,
      treatmentId: apt.treatmentId,
      startTime: apt.startTime,
      endTime: apt.endTime,
      notes: apt.notes,
      completed: apt.completed !== undefined ? apt.completed : false,
    }));

    await this.calendarEntryRepository.create(
      new CalendarEntry(
        '',
        doctorId,
        input.date,
        input.clinicId,
        input.startTime,
        input.endTime,
        appointments,
        undefined,
        undefined,
        input.notes
      )
    );
  }

  private validateInput(input: CreateCalendarEntryInput): void {
    if (!input.date || input.date.trim().length === 0) {
      throw new ValidationError('Date is required');
    }
    if (!DATE_REGEX.test(input.date)) {
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
    if (!TIME_REGEX.test(input.startTime)) {
      throw new ValidationError('Invalid startTime format. Use HH:mm format');
    }
    if (!TIME_REGEX.test(input.endTime)) {
      throw new ValidationError('Invalid endTime format. Use HH:mm format');
    }
    if (input.endTime <= input.startTime) {
      throw new ValidationError('endTime must be after startTime');
    }
  }
}

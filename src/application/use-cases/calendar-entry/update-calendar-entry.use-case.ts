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
  IUpdateCalendarEntryUseCase,
  UpdateCalendarEntryInput,
} from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import {
  DATE_REGEX,
  TIME_REGEX,
  assertAppointmentsResolvable,
  assertNotPastDate,
} from './appointment-validation.util';

@injectable()
export class UpdateCalendarEntryUseCase implements IUpdateCalendarEntryUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository,
    @inject('IClinicRepository') private clinicRepository: IClinicRepository,
    @inject('IPatientRepository') private patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateCalendarEntryInput): Promise<void> {
    const existingEntry = await this.calendarEntryRepository.findById(id);
    if (!existingEntry || existingEntry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', id);
    }

    if (input.date !== undefined && !DATE_REGEX.test(input.date)) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD format');
    }

    const updatedDate = input.date || existingEntry.date;
    const updatedClinicId = input.clinicId || existingEntry.clinicId;
    const updatedStartTime = input.startTime || existingEntry.startTime;
    const updatedEndTime = input.endTime || existingEntry.endTime;
    const updatedAppointments = input.appointments || existingEntry.appointments;

    if (input.date) {
      assertNotPastDate(updatedDate, 'update');
    }

    if (input.clinicId) {
      const clinicExists = await this.clinicRepository.existsByClinicIdAndDoctorId(
        updatedClinicId,
        doctorId
      );
      if (!clinicExists) {
        throw new NotFoundError('Clinic', updatedClinicId);
      }
    }

    if (input.startTime || input.endTime || input.clinicId || input.date) {
      if (input.clinicId || input.date) {
        const existingEntriesOnDate = await this.calendarEntryRepository.findByDate(
          updatedDate,
          doctorId
        );
        const sameClinicEntry = existingEntriesOnDate.find(
          (entry) => entry.clinicId === updatedClinicId && entry.id !== id
        );
        if (sameClinicEntry) {
          throw new ConflictError('Same clinic cannot be added multiple times on the same date');
        }
      }

      if (input.startTime && !TIME_REGEX.test(input.startTime)) {
        throw new ValidationError('Invalid startTime format. Use HH:mm format');
      }
      if (input.endTime && !TIME_REGEX.test(input.endTime)) {
        throw new ValidationError('Invalid endTime format. Use HH:mm format');
      }
      if (updatedEndTime <= updatedStartTime) {
        throw new ValidationError('endTime must be after startTime');
      }

      const overlappingEntries = await this.calendarEntryRepository.findOverlappingEntries(
        updatedDate,
        doctorId,
        updatedStartTime,
        updatedEndTime,
        id
      );
      if (overlappingEntries.length > 0) {
        throw new ConflictError(
          'Clinic visit time overlaps with existing calendar entry on the same date'
        );
      }
    }

    if (input.appointments) {
      if (updatedAppointments.length === 0) {
        throw new ValidationError('At least one appointment is required');
      }
      await assertAppointmentsResolvable(
        updatedAppointments,
        doctorId,
        updatedStartTime,
        updatedEndTime,
        this.patientRepository,
        this.treatmentRepository
      );
    }

    const updateData: Partial<CalendarEntry> = {};
    if (input.date) updateData.date = updatedDate;
    if (input.clinicId) updateData.clinicId = updatedClinicId;
    if (input.startTime) updateData.startTime = updatedStartTime;
    if (input.endTime) updateData.endTime = updatedEndTime;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.appointments) {
      updateData.appointments = updatedAppointments.map((apt) => ({
        patientId: apt.patientId,
        treatmentId: apt.treatmentId,
        startTime: apt.startTime,
        endTime: apt.endTime,
        notes: apt.notes,
        completed: apt.completed !== undefined ? apt.completed : false,
      }));
    }

    await this.calendarEntryRepository.update(id, updateData);
  }
}

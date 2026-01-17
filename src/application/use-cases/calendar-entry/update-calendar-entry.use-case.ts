import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IUpdateCalendarEntryUseCase, UpdateCalendarEntryInput } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

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
    if (!existingEntry) {
      throw new NotFoundError('CalendarEntry', id);
    }

    if (existingEntry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', id);
    }

    const updatedDate = input.date ? new Date(input.date) : existingEntry.date;
    const updatedClinicId = input.clinicId || existingEntry.clinicId;
    const updatedStartTime = input.startTime || existingEntry.startTime;
    const updatedEndTime = input.endTime || existingEntry.endTime;
    const updatedAppointments = input.appointments || existingEntry.appointments;

    if (input.date) {
      this.validatePastDate(updatedDate);
    }

    if (input.clinicId) {
      const clinicExists = await this.clinicRepository.existsByClinicIdAndDoctorId(updatedClinicId, doctorId);
      if (!clinicExists) {
        throw new NotFoundError('Clinic', updatedClinicId);
      }
    }

    if (input.startTime || input.endTime || input.clinicId || input.date) {
      if (input.clinicId || input.date) {
        const existingEntriesOnDate = await this.calendarEntryRepository.findByDate(updatedDate, doctorId);
        const sameClinicEntry = existingEntriesOnDate.find(entry => entry.clinicId === updatedClinicId && entry.id !== id);
        if (sameClinicEntry) {
          throw new ConflictError('Same clinic cannot be added multiple times on the same date');
        }
      }
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (input.startTime && !timeRegex.test(input.startTime)) {
        throw new ValidationError('Invalid startTime format. Use HH:mm format');
      }
      if (input.endTime && !timeRegex.test(input.endTime)) {
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
        throw new ConflictError('Clinic visit time overlaps with existing calendar entry on the same date');
      }
    }

    if (input.appointments) {
      await this.validateAppointments(updatedAppointments, doctorId, updatedStartTime, updatedEndTime);
    }

    const updateData: Partial<{
      date: Date;
      clinicId: string;
      startTime: string;
      endTime: string;
      notes?: string;
      appointments: Array<{ patientId: string; treatmentId: string; startTime: string; endTime: string; notes?: string; completed: boolean }>;
    }> = {};

    if (input.date) {
      updateData.date = updatedDate;
    }
    if (input.clinicId) {
      updateData.clinicId = updatedClinicId;
    }
    if (input.startTime) {
      updateData.startTime = updatedStartTime;
    }
    if (input.endTime) {
      updateData.endTime = updatedEndTime;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }
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

    await this.calendarEntryRepository.update(id, updateData as any);
  }

  private validatePastDate(date: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate < today) {
      throw new ValidationError('Cannot update calendar entry to past dates');
    }
  }

  private async validateAppointments(
    appointments: Array<{ patientId: string; treatmentId: string; startTime: string; endTime: string }>,
    doctorId: string,
    clinicStartTime: string,
    clinicEndTime: string
  ): Promise<void> {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

    if (!appointments || appointments.length === 0) {
      throw new ValidationError('At least one appointment is required');
    }

    for (let i = 0; i < appointments.length; i++) {
      const apt = appointments[i];

      if (!apt.patientId || apt.patientId.trim().length === 0) {
        throw new ValidationError(`patientId is required for appointment at index ${i}`);
      }

      if (!apt.treatmentId || apt.treatmentId.trim().length === 0) {
        throw new ValidationError(`treatmentId is required for appointment at index ${i}`);
      }

      if (!apt.startTime || apt.startTime.trim().length === 0) {
        throw new ValidationError(`startTime is required for appointment at index ${i}`);
      }

      if (!apt.endTime || apt.endTime.trim().length === 0) {
        throw new ValidationError(`endTime is required for appointment at index ${i}`);
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

      const patient = await this.patientRepository.findByIdAndDoctor(apt.patientId, doctorId);
      if (!patient) {
        throw new NotFoundError('Patient', apt.patientId);
      }

      const treatment = await this.treatmentRepository.findById(apt.treatmentId);
      if (!treatment || treatment.doctorId !== doctorId) {
        throw new NotFoundError('Treatment', apt.treatmentId);
      }
    }

    for (let i = 0; i < appointments.length; i++) {
      for (let j = i + 1; j < appointments.length; j++) {
        const apt1 = appointments[i];
        const apt2 = appointments[j];

        if (apt1.startTime < apt2.endTime && apt1.endTime > apt2.startTime) {
          throw new ConflictError(`Appointments at indices ${i} and ${j} overlap`);
        }
      }
    }
  }
}


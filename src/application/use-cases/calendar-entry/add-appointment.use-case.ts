import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import {
  IAddAppointmentUseCase,
  AppointmentInput,
} from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { assertWindowWithinSession, overlaps } from './appointment-validation.util';

@injectable()
export class AddAppointmentUseCase implements IAddAppointmentUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository,
    @inject('IPatientRepository') private patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(entryId: string, doctorId: string, appointment: AppointmentInput): Promise<void> {
    const entry = await this.calendarEntryRepository.findById(entryId);
    if (!entry || entry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', entryId);
    }

    if (!appointment.patientId || appointment.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }
    if (appointment.treatmentId !== undefined && appointment.treatmentId.trim().length === 0) {
      throw new ValidationError('treatmentId cannot be empty');
    }
    assertWindowWithinSession(
      appointment.startTime,
      appointment.endTime,
      entry.startTime,
      entry.endTime,
      ''
    );

    const patient = await this.patientRepository.findByIdAndDoctor(appointment.patientId, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', appointment.patientId);
    }

    if (appointment.treatmentId) {
      const treatment = await this.treatmentRepository.findById(appointment.treatmentId);
      if (!treatment || treatment.doctorId !== doctorId) {
        throw new NotFoundError('Treatment', appointment.treatmentId);
      }
    }

    if (appointment.startTime && appointment.endTime) {
      for (const existing of entry.appointments) {
        if (
          existing.startTime &&
          existing.endTime &&
          overlaps(appointment.startTime, appointment.endTime, existing.startTime, existing.endTime)
        ) {
          throw new ConflictError('Appointment time overlaps with existing appointment');
        }
      }
    }

    const updatedAppointments = [
      ...entry.appointments,
      {
        patientId: appointment.patientId,
        treatmentId: appointment.treatmentId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notes: appointment.notes,
        completed: appointment.completed !== undefined ? appointment.completed : false,
      },
    ];

    await this.calendarEntryRepository.update(entryId, { appointments: updatedAppointments });
  }
}

import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import {
  IUpdateAppointmentUseCase,
  AppointmentInput,
} from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { assertWindowWithinSession, overlaps } from './appointment-validation.util';

@injectable()
export class UpdateAppointmentUseCase implements IUpdateAppointmentUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository,
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(
    entryId: string,
    doctorId: string,
    appointmentIndex: number,
    appointment: AppointmentInput
  ): Promise<void> {
    const entry = await this.calendarEntryRepository.findById(entryId);
    if (!entry || entry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', entryId);
    }

    if (appointmentIndex < 0 || appointmentIndex >= entry.appointments.length) {
      throw new NotFoundError('Appointment', appointmentIndex.toString());
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

    if (appointment.treatmentId) {
      const treatment = await this.treatmentRepository.findById(appointment.treatmentId);
      if (!treatment || treatment.doctorId !== doctorId) {
        throw new NotFoundError('Treatment', appointment.treatmentId);
      }
    }

    if (appointment.startTime && appointment.endTime) {
      for (let i = 0; i < entry.appointments.length; i++) {
        if (i === appointmentIndex) continue;
        const existing = entry.appointments[i];
        if (
          existing.startTime &&
          existing.endTime &&
          overlaps(appointment.startTime, appointment.endTime, existing.startTime, existing.endTime)
        ) {
          throw new ConflictError('Appointment time overlaps with existing appointment');
        }
      }
    }

    // patientId and completed are not editable through this route; the original
    // carried both across from the stored appointment.
    const existingAppointment = entry.appointments[appointmentIndex];
    const updatedAppointments = [...entry.appointments];
    updatedAppointments[appointmentIndex] = {
      patientId: existingAppointment.patientId,
      treatmentId: appointment.treatmentId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      notes: appointment.notes,
      completed: existingAppointment.completed !== undefined ? existingAppointment.completed : false,
    };

    await this.calendarEntryRepository.update(entryId, { appointments: updatedAppointments });
  }
}

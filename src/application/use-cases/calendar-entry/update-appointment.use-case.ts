import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IUpdateAppointmentUseCase, AppointmentInput } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class UpdateAppointmentUseCase implements IUpdateAppointmentUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository,
    @inject('IPatientRepository') private patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(entryId: string, doctorId: string, appointmentIndex: number, appointment: AppointmentInput): Promise<void> {
    const entry = await this.calendarEntryRepository.findById(entryId);
    if (!entry) {
      throw new NotFoundError('CalendarEntry', entryId);
    }

    if (entry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', entryId);
    }

    if (appointmentIndex < 0 || appointmentIndex >= entry.appointments.length) {
      throw new NotFoundError('Appointment', appointmentIndex.toString());
    }

    this.validateAppointment(appointment, entry.startTime, entry.endTime);

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
      for (let i = 0; i < entry.appointments.length; i++) {
        if (i === appointmentIndex) continue;

        const existingAppt = entry.appointments[i];
        if (existingAppt.startTime && existingAppt.endTime) {
          if (appointment.startTime < existingAppt.endTime && appointment.endTime > existingAppt.startTime) {
            throw new ConflictError('Appointment time overlaps with existing appointment');
          }
        }
      }
    }

    const updatedAppointments = [...entry.appointments];
    updatedAppointments[appointmentIndex] = {
      patientId: appointment.patientId,
      treatmentId: appointment.treatmentId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      notes: appointment.notes,
      completed: appointment.completed !== undefined ? appointment.completed : false,
    };

    await this.calendarEntryRepository.update(entryId, { appointments: updatedAppointments });
  }

  private validateAppointment(
    appointment: AppointmentInput,
    clinicStartTime: string,
    clinicEndTime: string
  ): void {
    if (!appointment.patientId || appointment.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }

    if (appointment.treatmentId && appointment.treatmentId.trim().length === 0) {
      throw new ValidationError('treatmentId cannot be empty');
    }

    if (appointment.startTime || appointment.endTime) {
      if (!appointment.startTime || appointment.startTime.trim().length === 0) {
        throw new ValidationError('startTime is required when endTime is provided');
      }

      if (!appointment.endTime || appointment.endTime.trim().length === 0) {
        throw new ValidationError('endTime is required when startTime is provided');
      }

      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointment.startTime)) {
        throw new ValidationError('Invalid startTime format. Use HH:mm format');
      }

      if (!timeRegex.test(appointment.endTime)) {
        throw new ValidationError('Invalid endTime format. Use HH:mm format');
      }

      if (appointment.endTime <= appointment.startTime) {
        throw new ValidationError('endTime must be after startTime');
      }

      if (appointment.startTime < clinicStartTime || appointment.endTime > clinicEndTime) {
        throw new ValidationError(`Appointment must be within clinic hours (${clinicStartTime} - ${clinicEndTime})`);
      }
    }
  }
}


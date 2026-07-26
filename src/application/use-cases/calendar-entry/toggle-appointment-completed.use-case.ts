import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IToggleAppointmentCompletedUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class ToggleAppointmentCompletedUseCase implements IToggleAppointmentCompletedUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(entryId: string, doctorId: string, appointmentIndex: number): Promise<void> {
    const entry = await this.calendarEntryRepository.findById(entryId);
    if (!entry || entry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', entryId);
    }

    if (appointmentIndex < 0 || appointmentIndex >= entry.appointments.length) {
      throw new NotFoundError('Appointment', appointmentIndex.toString());
    }

    const existingAppointment = entry.appointments[appointmentIndex];
    const updatedAppointments = [...entry.appointments];
    updatedAppointments[appointmentIndex] = {
      ...existingAppointment,
      completed: !(existingAppointment.completed ?? false),
    };

    await this.calendarEntryRepository.update(entryId, { appointments: updatedAppointments });
  }
}

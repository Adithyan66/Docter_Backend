import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { ICalendarEntryController } from '../interfaces/controllers/calendar-entry-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import {
  ICreateCalendarEntryUseCase,
  IUpdateCalendarEntryUseCase,
  IDeleteCalendarEntryUseCase,
  IGetCalendarEntryUseCase,
  IAddAppointmentUseCase,
  IUpdateAppointmentUseCase,
  IDeleteAppointmentUseCase,
  IGetAppointmentsUseCase,
  IGetMonthlyCalendarUseCase,
  IGetCalendarEntriesByDateUseCase,
} from '../../application/interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateCalendarEntryRequestDto, UpdateCalendarEntryRequestDto, CalendarEntryResponseDto, AppointmentDto, CalendarEntryByDateResponseDto } from '../dto/calendar-entry.dto';
import { CalendarEntry } from '../../domain/entities/calendar-entry.entity';
import { getUserId } from '../utils/user-context.util';

@injectable()
export class CalendarEntryController implements ICalendarEntryController {
  constructor(
    @inject('ICreateCalendarEntryUseCase') private readonly createCalendarEntryUseCase: ICreateCalendarEntryUseCase,
    @inject('IUpdateCalendarEntryUseCase') private readonly updateCalendarEntryUseCase: IUpdateCalendarEntryUseCase,
    @inject('IDeleteCalendarEntryUseCase') private readonly deleteCalendarEntryUseCase: IDeleteCalendarEntryUseCase,
    @inject('IGetCalendarEntryUseCase') private readonly getCalendarEntryUseCase: IGetCalendarEntryUseCase,
    @inject('IAddAppointmentUseCase') private readonly addAppointmentUseCase: IAddAppointmentUseCase,
    @inject('IUpdateAppointmentUseCase') private readonly updateAppointmentUseCase: IUpdateAppointmentUseCase,
    @inject('IDeleteAppointmentUseCase') private readonly deleteAppointmentUseCase: IDeleteAppointmentUseCase,
    @inject('IGetAppointmentsUseCase') private readonly getAppointmentsUseCase: IGetAppointmentsUseCase,
    @inject('IGetMonthlyCalendarUseCase') private readonly getMonthlyCalendarUseCase: IGetMonthlyCalendarUseCase,
    @inject('IGetCalendarEntriesByDateUseCase') private readonly getCalendarEntriesByDateUseCase: IGetCalendarEntriesByDateUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as CreateCalendarEntryRequestDto;
    await this.createCalendarEntryUseCase.execute(doctorId, input);
    
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as UpdateCalendarEntryRequestDto;
    await this.updateCalendarEntryUseCase.execute(id, doctorId, input);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const doctorId = getUserId(req);
    await this.deleteCalendarEntryUseCase.execute(id, doctorId);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const doctorId = getUserId(req);
    const entry = await this.getCalendarEntryUseCase.execute(id, doctorId);
    
    const response: CalendarEntryResponseDto = this.toResponseDto(entry);
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async addAppointment(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const entryId = req.params.id;
    if (!entryId) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const doctorId = getUserId(req);
    const appointment = req.body as AppointmentDto;
    await this.addAppointmentUseCase.execute(entryId, doctorId, appointment);
    
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async updateAppointment(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const entryId = req.params.id;
    if (!entryId) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const appointmentIndexParam = req.params.appointmentIndex;
    if (!appointmentIndexParam) {
      throw new ValidationError('Appointment index is required');
    }

    const appointmentIndex = parseInt(appointmentIndexParam, 10);
    if (isNaN(appointmentIndex) || appointmentIndex < 0) {
      throw new ValidationError('Invalid appointment index');
    }

    const doctorId = getUserId(req);
    const appointment = req.body as AppointmentDto;
    await this.updateAppointmentUseCase.execute(entryId, doctorId, appointmentIndex, appointment);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async deleteAppointment(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const entryId = req.params.id;
    if (!entryId) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const appointmentIndexParam = req.params.appointmentIndex;
    if (!appointmentIndexParam) {
      throw new ValidationError('Appointment index is required');
    }

    const appointmentIndex = parseInt(appointmentIndexParam, 10);
    if (isNaN(appointmentIndex) || appointmentIndex < 0) {
      throw new ValidationError('Invalid appointment index');
    }

    const doctorId = getUserId(req);
    await this.deleteAppointmentUseCase.execute(entryId, doctorId, appointmentIndex);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getAppointments(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const entryId = req.params.id;
    if (!entryId) {
      throw new ValidationError('Calendar entry ID is required');
    }

    const doctorId = getUserId(req);
    const entry = await this.getAppointmentsUseCase.execute(entryId, doctorId);
    
    const response: CalendarEntryResponseDto = this.toResponseDto(entry);
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getMonthly(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const monthParam = req.query.month;
    const yearParam = req.query.year;

    if (!monthParam) {
      throw new ValidationError('Month parameter is required');
    }

    if (!yearParam) {
      throw new ValidationError('Year parameter is required');
    }

    const month = parseInt(String(monthParam), 10);
    const year = parseInt(String(yearParam), 10);

    if (isNaN(month) || isNaN(year)) {
      throw new ValidationError('Month and year must be valid numbers');
    }

    const doctorId = getUserId(req);
    const days = await this.getMonthlyCalendarUseCase.execute(doctorId, month, year);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const response = {
      month,
      monthName: monthNames[month - 1],
      year,
      days,
    };

    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getByDate(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const date = req.query.date as string;

    if (!date) {
      throw new ValidationError('Date parameter is required');
    }

    const doctorId = getUserId(req);
    const entries = await this.getCalendarEntriesByDateUseCase.execute(doctorId, date);

    const response: CalendarEntryByDateResponseDto = {
      date,
      entries,
    };

    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private toResponseDto(entry: CalendarEntry): CalendarEntryResponseDto {
    return {
      id: entry.id,
      doctorId: entry.doctorId,
      date: entry.date,
      clinicId: entry.clinicId,
      startTime: entry.startTime,
      endTime: entry.endTime,
      notes: entry.notes,
      appointments: entry.appointments.map((apt) => ({
        patientId: apt.patientId,
        treatmentId: apt.treatmentId,
        startTime: apt.startTime,
        endTime: apt.endTime,
        notes: apt.notes,
        completed: apt.completed !== undefined ? apt.completed : false,
      })),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}


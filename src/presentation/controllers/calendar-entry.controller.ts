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
  IToggleAppointmentCompletedUseCase,
  IGetAppointmentsUseCase,
  IGetMonthlyCalendarUseCase,
  IGetCalendarEntriesByDateUseCase,
} from '../../application/interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { ValidationError } from '../../domain/errors/validation.error';
import {
  CreateCalendarEntryRequestDto,
  UpdateCalendarEntryRequestDto,
  CalendarEntryResponseDto,
  CalendarEntryByDateResponseDto,
  MonthlyCalendarResponseDto,
  AppointmentDto,
} from '../dto/calendar-entry.dto';
import { CalendarEntry } from '../../domain/entities/calendar-entry.entity';
import { getUserId } from '../utils/user-context.util';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@injectable()
export class CalendarEntryController implements ICalendarEntryController {
  constructor(
    @inject('ICreateCalendarEntryUseCase')
    private readonly createCalendarEntryUseCase: ICreateCalendarEntryUseCase,
    @inject('IUpdateCalendarEntryUseCase')
    private readonly updateCalendarEntryUseCase: IUpdateCalendarEntryUseCase,
    @inject('IDeleteCalendarEntryUseCase')
    private readonly deleteCalendarEntryUseCase: IDeleteCalendarEntryUseCase,
    @inject('IGetCalendarEntryUseCase')
    private readonly getCalendarEntryUseCase: IGetCalendarEntryUseCase,
    @inject('IAddAppointmentUseCase')
    private readonly addAppointmentUseCase: IAddAppointmentUseCase,
    @inject('IUpdateAppointmentUseCase')
    private readonly updateAppointmentUseCase: IUpdateAppointmentUseCase,
    @inject('IDeleteAppointmentUseCase')
    private readonly deleteAppointmentUseCase: IDeleteAppointmentUseCase,
    @inject('IToggleAppointmentCompletedUseCase')
    private readonly toggleAppointmentCompletedUseCase: IToggleAppointmentCompletedUseCase,
    @inject('IGetAppointmentsUseCase')
    private readonly getAppointmentsUseCase: IGetAppointmentsUseCase,
    @inject('IGetMonthlyCalendarUseCase')
    private readonly getMonthlyCalendarUseCase: IGetMonthlyCalendarUseCase,
    @inject('IGetCalendarEntriesByDateUseCase')
    private readonly getCalendarEntriesByDateUseCase: IGetCalendarEntriesByDateUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const input = this.requireBody<CreateCalendarEntryRequestDto>(req);
    await this.createCalendarEntryUseCase.execute(getUserId(req), input);
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const input = this.requireBody<UpdateCalendarEntryRequestDto>(req);
    const id = this.requireEntryId(req);
    await this.updateCalendarEntryUseCase.execute(id, getUserId(req), input);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const id = this.requireEntryId(req);
    await this.deleteCalendarEntryUseCase.execute(id, getUserId(req));
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const id = this.requireEntryId(req);
    const entry = await this.getCalendarEntryUseCase.execute(id, getUserId(req));
    successResponse(res, this.toResponseDto(entry), HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async addAppointment(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const appointment = this.requireBody<AppointmentDto>(req);
    const entryId = this.requireEntryId(req);
    await this.addAppointmentUseCase.execute(entryId, getUserId(req), appointment);
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async updateAppointment(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const appointment = this.requireBody<AppointmentDto>(req);
    const entryId = this.requireEntryId(req);
    const index = this.requireAppointmentIndex(req);
    await this.updateAppointmentUseCase.execute(entryId, getUserId(req), index, appointment);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async deleteAppointment(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const entryId = this.requireEntryId(req);
    const index = this.requireAppointmentIndex(req);
    await this.deleteAppointmentUseCase.execute(entryId, getUserId(req), index);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async toggleAppointmentCompleted(
    req: HttpRequest,
    res: HttpResponse,
    _next?: HttpNext
  ): Promise<void> {
    const entryId = this.requireEntryId(req);
    const index = this.requireAppointmentIndex(req);
    await this.toggleAppointmentCompletedUseCase.execute(entryId, getUserId(req), index);
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async getAppointments(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const entryId = this.requireEntryId(req);
    const entry = await this.getAppointmentsUseCase.execute(entryId, getUserId(req));
    successResponse(res, this.toResponseDto(entry), HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getMonthly(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
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

    const days = await this.getMonthlyCalendarUseCase.execute(getUserId(req), month, year);

    const response: MonthlyCalendarResponseDto = {
      month,
      monthName: MONTH_NAMES[month - 1],
      year,
      days,
    };
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getByDate(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const date = req.query.date as string;
    if (!date) {
      throw new ValidationError('Date parameter is required');
    }

    const entries = await this.getCalendarEntriesByDateUseCase.execute(getUserId(req), date);

    const response: CalendarEntryByDateResponseDto = { date, entries };
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private requireBody<T>(req: HttpRequest): T {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }
    return req.body as T;
  }

  private requireEntryId(req: HttpRequest): string {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Calendar entry ID is required');
    }
    return id;
  }

  private requireAppointmentIndex(req: HttpRequest): number {
    const raw = req.params.appointmentIndex;
    if (!raw) {
      throw new ValidationError('Appointment index is required');
    }
    const index = parseInt(raw, 10);
    if (isNaN(index) || index < 0) {
      throw new ValidationError('Invalid appointment index');
    }
    return index;
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

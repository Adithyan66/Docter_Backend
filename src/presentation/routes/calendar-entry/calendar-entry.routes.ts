import { Router } from '../../interfaces';
import { CalendarEntryController } from '../../controllers/calendar-entry.controller';
import { validate } from '../../middleware/validation.middleware';
import { createCalendarEntrySchema, updateCalendarEntrySchema, appointmentSchema } from '../../validators/calendar-entry.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';

export const setupCalendarEntryRoutes = (router: Router): void => {
  const calendarEntryController = container.resolve(CalendarEntryController);
  const auth = authMiddleware();

  router.post('/calendar-entry', auth, doctorOnly, validate(createCalendarEntrySchema), asyncHandler(calendarEntryController.create.bind(calendarEntryController)));

  router.get('/calendar-entry/monthly', auth, doctorOnly, asyncHandler(calendarEntryController.getMonthly.bind(calendarEntryController)));

  router.get('/calendar-entry/by-date', auth, doctorOnly, asyncHandler(calendarEntryController.getByDate.bind(calendarEntryController)));

  router.get('/calendar-entry/:id', auth, doctorOnly, asyncHandler(calendarEntryController.getById.bind(calendarEntryController)));

  router.patch('/calendar-entry/:id', auth, doctorOnly, validate(updateCalendarEntrySchema), asyncHandler(calendarEntryController.update.bind(calendarEntryController)));

  router.delete('/calendar-entry/:id', auth, doctorOnly, asyncHandler(calendarEntryController.delete.bind(calendarEntryController)));

  router.post('/calendar-entry/:id/appointments', auth, doctorOnly, validate(appointmentSchema), asyncHandler(calendarEntryController.addAppointment.bind(calendarEntryController)));

  router.get('/calendar-entry/:id/appointments', auth, doctorOnly, asyncHandler(calendarEntryController.getAppointments.bind(calendarEntryController)));

  router.patch('/calendar-entry/:id/appointments/:appointmentIndex', auth, doctorOnly, validate(appointmentSchema), asyncHandler(calendarEntryController.updateAppointment.bind(calendarEntryController)));

  router.delete('/calendar-entry/:id/appointments/:appointmentIndex', auth, doctorOnly, asyncHandler(calendarEntryController.deleteAppointment.bind(calendarEntryController)));
};


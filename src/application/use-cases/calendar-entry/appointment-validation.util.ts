import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { AppointmentInput } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

export const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Today in UTC as YYYY-MM-DD. Workers have no local timezone, so "past date" is
 * evaluated against UTC. For timezones ahead of UTC (the deployment's users) this
 * is permissive at worst — it never rejects a date the user considers today.
 */
export const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const assertNotPastDate = (date: string, action: 'create' | 'update'): void => {
  if (date < todayIso()) {
    throw new ValidationError(
      action === 'create'
        ? 'Cannot create calendar entry for past dates'
        : 'Cannot update calendar entry to past dates'
    );
  }
};

/** HH:mm strings compare lexicographically, so this is a chronological overlap test. */
export const overlaps = (
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean => aStart < bEnd && aEnd > bStart;

export const assertWindowWithinSession = (
  startTime: string | undefined,
  endTime: string | undefined,
  sessionStart: string,
  sessionEnd: string,
  label: string
): void => {
  if (!startTime && !endTime) return;

  if (!startTime || startTime.trim().length === 0) {
    throw new ValidationError(`startTime is required when endTime is provided${label}`);
  }
  if (!endTime || endTime.trim().length === 0) {
    throw new ValidationError(`endTime is required when startTime is provided${label}`);
  }
  if (!TIME_REGEX.test(startTime)) {
    throw new ValidationError(`Invalid startTime format${label}. Use HH:mm format`);
  }
  if (!TIME_REGEX.test(endTime)) {
    throw new ValidationError(`Invalid endTime format${label}. Use HH:mm format`);
  }
  if (endTime <= startTime) {
    throw new ValidationError(`endTime must be after startTime${label}`);
  }
  if (startTime < sessionStart || endTime > sessionEnd) {
    throw new ValidationError(
      `Appointment${label} must be within clinic hours (${sessionStart} - ${sessionEnd})`
    );
  }
};

export const assertNoMutualOverlap = (appointments: AppointmentInput[]): void => {
  for (let i = 0; i < appointments.length; i++) {
    for (let j = i + 1; j < appointments.length; j++) {
      const a = appointments[i];
      const b = appointments[j];
      if (a.startTime && a.endTime && b.startTime && b.endTime) {
        if (overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
          throw new ConflictError(`Appointments at indices ${i} and ${j} overlap`);
        }
      }
    }
  }
};

/**
 * Confirms every referenced patient and treatment belongs to this doctor. Without
 * this, an appointment can be stored pointing at another doctor's patient and then
 * silently vanish from the day view, which filters unresolvable patients out.
 */
export const assertAppointmentsResolvable = async (
  appointments: AppointmentInput[],
  doctorId: string,
  sessionStart: string,
  sessionEnd: string,
  patientRepository: IPatientRepository,
  treatmentRepository: ITreatmentRepository
): Promise<void> => {
  for (let i = 0; i < appointments.length; i++) {
    const apt = appointments[i];
    const label = ` at index ${i}`;

    if (!apt.patientId || apt.patientId.trim().length === 0) {
      throw new ValidationError(`patientId is required for appointment${label}`);
    }

    const patient = await patientRepository.findByIdAndDoctor(apt.patientId, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', apt.patientId);
    }

    if (apt.treatmentId !== undefined) {
      if (apt.treatmentId.trim().length === 0) {
        throw new ValidationError(`treatmentId cannot be empty for appointment${label}`);
      }
      const treatment = await treatmentRepository.findById(apt.treatmentId);
      if (!treatment || treatment.doctorId !== doctorId) {
        throw new NotFoundError('Treatment', apt.treatmentId);
      }
    }

    assertWindowWithinSession(apt.startTime, apt.endTime, sessionStart, sessionEnd, label);
  }

  assertNoMutualOverlap(appointments);
};

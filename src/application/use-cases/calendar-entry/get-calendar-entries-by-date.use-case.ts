import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGetCalendarEntriesByDateUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class GetCalendarEntriesByDateUseCase implements IGetCalendarEntriesByDateUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository,
    @inject('IClinicRepository') private clinicRepository: IClinicRepository,
    @inject('IPatientRepository') private patientRepository: IPatientRepository,
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(doctorId: string, date: string): Promise<Array<{
    id: string;
    clinic: { id: string; name: string };
    startTime: string;
    endTime: string;
    notes?: string;
    appointments: Array<{
      patientId: string;
      patient: { id: string; fullName: string; mobile?: string };
      treatmentId: string;
      treatment: { id: string; name: string };
      startTime: string;
      endTime: string;
      notes?: string;
      completed: boolean;
    }>;
  }>> {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(date)) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD format');
    }

    const entryDate = new Date(date);
    const entries = await this.calendarEntryRepository.findByDate(entryDate, doctorId);

    const clinicIds = new Set<string>();
    const patientIds = new Set<string>();
    const treatmentIds = new Set<string>();

    entries.forEach(entry => {
      clinicIds.add(entry.clinicId);
      entry.appointments.forEach(apt => {
        patientIds.add(apt.patientId);
        if (apt.treatmentId) {
          treatmentIds.add(apt.treatmentId);
        }
      });
    });

    const clinicMap = new Map<string, { id: string; name: string }>();
    for (const clinicId of clinicIds) {
      const clinic = await this.clinicRepository.findById(clinicId);
      if (clinic && clinic.doctorId === doctorId) {
        clinicMap.set(clinicId, { id: clinicId, name: clinic.name });
      }
    }

    const patientMap = new Map<string, { id: string; fullName: string; mobile?: string }>();
    for (const patientId of patientIds) {
      const patient = await this.patientRepository.findByIdAndDoctor(patientId, doctorId);
      if (patient) {
        patientMap.set(patientId, {
          id: patientId,
          fullName: patient.fullName,
          mobile: patient.phone ? patient.phone.toString() : undefined,
        });
      }
    }

    const treatmentMap = new Map<string, { id: string; name: string }>();
    for (const treatmentId of treatmentIds) {
      const treatment = await this.treatmentRepository.findById(treatmentId);
      if (treatment && treatment.doctorId === doctorId) {
        treatmentMap.set(treatmentId, { id: treatmentId, name: treatment.name });
      }
    }

    const result = entries.map(entry => {
      const clinic = clinicMap.get(entry.clinicId);
      if (!clinic) {
        return null;
      }

      const appointments = entry.appointments.map(apt => {
        const patient = patientMap.get(apt.patientId);

        if (!patient) {
          return null;
        }

        const treatment = apt.treatmentId ? treatmentMap.get(apt.treatmentId) : undefined;

        return {
          patientId: apt.patientId,
          patient: {
            id: patient.id,
            fullName: patient.fullName,
            mobile: patient.mobile,
          },
          treatmentId: apt.treatmentId,
          treatment: treatment ? {
            id: treatment.id,
            name: treatment.name,
          } : undefined,
          startTime: apt.startTime,
          endTime: apt.endTime,
          notes: apt.notes,
          completed: apt.completed !== undefined ? apt.completed : false,
        };
      }).filter((apt): apt is NonNullable<typeof apt> => apt !== null);

      return {
        id: entry.id,
        clinic,
        startTime: entry.startTime,
        endTime: entry.endTime,
        notes: entry.notes,
        appointments,
      };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return result;
  }
}


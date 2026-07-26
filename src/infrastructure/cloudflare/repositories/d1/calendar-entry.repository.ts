import { injectable, inject } from 'tsyringe';
import { and, asc, eq, gt, gte, inArray, lt, lte, ne, or } from 'drizzle-orm';
import {
  ICalendarEntryRepository,
  CalendarEntryDetail,
  CalendarEntryAppointmentDetail,
  MonthlyCalendarDay,
} from '../../../../domain/repositories/calendar-entry.repository';
import { CalendarEntry, Appointment } from '../../../../domain/entities/calendar-entry.entity';
import { getDb, Database } from '../../db/client';
import {
  calendarEntries,
  clinics,
  patients,
  treatments,
  AppointmentItem,
  CalendarEntryRow,
} from '../../db/schema';

/**
 * D1 port of the Mongo calendar repository. The two read paths were aggregation
 * pipelines there; D1 has no equivalent, so the joins are done as batched lookups
 * and the grouping in TypeScript. Appointment counts per day are small (a clinic
 * session), so the extra round trips are bounded and constant, not per-row.
 */
@injectable()
export class D1CalendarEntryRepository implements ICalendarEntryRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<CalendarEntry | null> {
    const row = await this.db.select().from(calendarEntries).where(eq(calendarEntries.id, id)).get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<CalendarEntry[]> {
    const rows = await this.db.select().from(calendarEntries).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: CalendarEntry): Promise<CalendarEntry> {
    const now = new Date();
    const row: CalendarEntryRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      clinicId: entity.clinicId,
      date: entity.date,
      startTime: entity.startTime,
      endTime: entity.endTime,
      notes: entity.notes ?? null,
      appointments: entity.appointments.map((a) => this.toRowAppointment(a)),
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(calendarEntries).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<CalendarEntry>): Promise<CalendarEntry | null> {
    const updateData: Partial<CalendarEntryRow> = { updatedAt: new Date() };

    if (entity.doctorId !== undefined) updateData.doctorId = entity.doctorId;
    if (entity.clinicId !== undefined) updateData.clinicId = entity.clinicId;
    if (entity.date !== undefined) updateData.date = entity.date;
    if (entity.startTime !== undefined) updateData.startTime = entity.startTime;
    if (entity.endTime !== undefined) updateData.endTime = entity.endTime;
    if (entity.notes !== undefined) updateData.notes = entity.notes ?? null;
    if (entity.appointments !== undefined) {
      updateData.appointments = entity.appointments.map((a) => this.toRowAppointment(a));
    }

    const row = await this.db
      .update(calendarEntries)
      .set(updateData)
      .where(eq(calendarEntries.id, id))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .delete(calendarEntries)
      .where(eq(calendarEntries.id, id))
      .returning({ id: calendarEntries.id })
      .all();
    return rows.length > 0;
  }

  async findByDate(date: string, doctorId: string): Promise<CalendarEntry[]> {
    const rows = await this.db
      .select()
      .from(calendarEntries)
      .where(and(eq(calendarEntries.doctorId, doctorId), eq(calendarEntries.date, date)))
      .orderBy(asc(calendarEntries.startTime))
      .all();
    return rows.map((r) => this.toDomain(r));
  }

  async findByDateRange(startDate: string, endDate: string, doctorId: string): Promise<CalendarEntry[]> {
    const rows = await this.db
      .select()
      .from(calendarEntries)
      .where(
        and(
          eq(calendarEntries.doctorId, doctorId),
          gte(calendarEntries.date, startDate),
          lte(calendarEntries.date, endDate)
        )
      )
      .orderBy(asc(calendarEntries.date), asc(calendarEntries.startTime))
      .all();
    return rows.map((r) => this.toDomain(r));
  }

  async findByDateAndId(id: string, date: string, doctorId: string): Promise<CalendarEntry | null> {
    const row = await this.db
      .select()
      .from(calendarEntries)
      .where(
        and(
          eq(calendarEntries.id, id),
          eq(calendarEntries.doctorId, doctorId),
          eq(calendarEntries.date, date)
        )
      )
      .get();
    return row ? this.toDomain(row) : null;
  }

  /** Half-open overlap: existing.start < new.end AND existing.end > new.start. */
  async findOverlappingEntries(
    date: string,
    doctorId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<CalendarEntry[]> {
    const conditions = [
      eq(calendarEntries.doctorId, doctorId),
      eq(calendarEntries.date, date),
      lt(calendarEntries.startTime, endTime),
      gt(calendarEntries.endTime, startTime),
    ];
    if (excludeId) conditions.push(ne(calendarEntries.id, excludeId));

    const rows = await this.db
      .select()
      .from(calendarEntries)
      .where(and(...conditions))
      .all();
    return rows.map((r) => this.toDomain(r));
  }

  async findMonthlyCalendarData(
    startDate: string,
    endDate: string,
    doctorId: string
  ): Promise<MonthlyCalendarDay[]> {
    // Inner join mirrors the Mongo $unwind with preserveNullAndEmptyArrays:false —
    // entries whose clinic was deleted drop out of the month view entirely.
    const rows = await this.db
      .select({ date: calendarEntries.date, clinicName: clinics.name })
      .from(calendarEntries)
      .innerJoin(clinics, eq(clinics.id, calendarEntries.clinicId))
      .where(
        and(
          eq(calendarEntries.doctorId, doctorId),
          gte(calendarEntries.date, startDate),
          lte(calendarEntries.date, endDate),
          eq(clinics.doctorId, doctorId),
          eq(clinics.isDeleted, false)
        )
      )
      .all();

    const byDate = new Map<string, Set<string>>();
    for (const row of rows) {
      const names = byDate.get(row.date) ?? new Set<string>();
      names.add(row.clinicName);
      byDate.set(row.date, names);
    }

    return [...byDate.entries()]
      .map(([date, names]) => ({ date, clinics: [...names] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async findByDateWithDetails(date: string, doctorId: string): Promise<CalendarEntryDetail[]> {
    const rows = await this.db
      .select({ entry: calendarEntries, clinicId: clinics.id, clinicName: clinics.name })
      .from(calendarEntries)
      .innerJoin(clinics, eq(clinics.id, calendarEntries.clinicId))
      .where(
        and(
          eq(calendarEntries.doctorId, doctorId),
          eq(calendarEntries.date, date),
          eq(clinics.doctorId, doctorId),
          eq(clinics.isDeleted, false)
        )
      )
      .orderBy(asc(calendarEntries.startTime))
      .all();

    if (rows.length === 0) return [];

    const appointmentRefs = rows.flatMap((r) => r.entry.appointments ?? []);
    const patientRefs = [...new Set(appointmentRefs.map((a) => a.patientId).filter(Boolean))];
    const treatmentIds = [
      ...new Set(appointmentRefs.map((a) => a.treatmentId).filter((id): id is string => !!id)),
    ];

    const [patientsById, treatmentsById] = await Promise.all([
      this.loadPatients(patientRefs, doctorId),
      this.loadTreatments(treatmentIds, doctorId),
    ]);

    return rows.map((row) => ({
      id: row.entry.id,
      clinic: { id: row.clinicId, name: row.clinicName },
      startTime: row.entry.startTime,
      endTime: row.entry.endTime,
      notes: row.entry.notes ?? undefined,
      appointments: (row.entry.appointments ?? []).reduce<CalendarEntryAppointmentDetail[]>(
        (acc, apt) => {
          const patient = patientsById.get(apt.patientId);
          // Mongo dropped appointments whose patient lookup came back empty
          // (deleted or belonging to another doctor); preserve that.
          if (!patient) return acc;

          const treatment = apt.treatmentId ? treatmentsById.get(apt.treatmentId) : undefined;
          acc.push({
            patientId: apt.patientId,
            patient,
            treatmentId: apt.treatmentId,
            treatment,
            startTime: apt.startTime,
            endTime: apt.endTime,
            notes: apt.notes,
            completed: apt.completed ?? false,
          });
          return acc;
        },
        []
      ),
    }));
  }

  /**
   * Appointments reference a patient by either the UUID primary key or the
   * human-facing patientId code, so both columns are matched — same as the
   * `$or` in the original pipeline. The returned map is keyed by both.
   */
  private async loadPatients(
    refs: string[],
    doctorId: string
  ): Promise<Map<string, CalendarEntryAppointmentDetail['patient']>> {
    const map = new Map<string, CalendarEntryAppointmentDetail['patient']>();
    if (refs.length === 0) return map;

    const rows = await this.db
      .select({
        id: patients.id,
        patientId: patients.patientId,
        fullName: patients.fullName,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phone: patients.phone,
        email: patients.email,
        profilePicUrl: patients.profilePicUrl,
      })
      .from(patients)
      .where(
        and(
          eq(patients.doctorId, doctorId),
          eq(patients.isDeleted, false),
          or(inArray(patients.id, refs), inArray(patients.patientId, refs))
        )
      )
      .all();

    const wanted = new Set(refs);
    for (const row of rows) {
      const matchesId = wanted.has(row.id);
      const matchesCode = !!row.patientId && wanted.has(row.patientId);

      const detail = {
        id: row.id,
        fullName: row.fullName ?? [row.firstName, row.lastName].filter(Boolean).join(' '),
        mobile: row.phone ?? undefined,
        email: row.email ?? undefined,
        profilePicUrl: row.profilePicUrl ?? undefined,
        patientId: row.patientId ?? undefined,
      };
      if (matchesId) map.set(row.id, detail);
      if (matchesCode && row.patientId) map.set(row.patientId, detail);
    }
    return map;
  }

  private async loadTreatments(
    ids: string[],
    doctorId: string
  ): Promise<Map<string, { id: string; name: string }>> {
    const map = new Map<string, { id: string; name: string }>();
    if (ids.length === 0) return map;

    const rows = await this.db
      .select({ id: treatments.id, name: treatments.name })
      .from(treatments)
      .where(
        and(
          inArray(treatments.id, ids),
          eq(treatments.doctorId, doctorId),
          eq(treatments.isDeleted, false)
        )
      )
      .all();

    for (const row of rows) map.set(row.id, { id: row.id, name: row.name });
    return map;
  }

  private toRowAppointment(apt: Appointment): AppointmentItem {
    return {
      patientId: apt.patientId,
      treatmentId: apt.treatmentId,
      startTime: apt.startTime,
      endTime: apt.endTime,
      notes: apt.notes,
      completed: apt.completed ?? false,
    };
  }

  private toDomain(row: CalendarEntryRow): CalendarEntry {
    const appointments: Appointment[] = (row.appointments ?? []).map((apt) => ({
      patientId: apt.patientId,
      treatmentId: apt.treatmentId,
      startTime: apt.startTime,
      endTime: apt.endTime,
      notes: apt.notes,
      completed: apt.completed ?? false,
    }));

    return new CalendarEntry(
      row.id,
      row.doctorId,
      row.date,
      row.clinicId,
      row.startTime,
      row.endTime,
      appointments,
      row.createdAt,
      row.updatedAt,
      row.notes ?? undefined
    );
  }
}

import { injectable, inject } from 'tsyringe';
import { and, eq, gte, lte, inArray, isNotNull, asc, desc, sql, SQL } from 'drizzle-orm';
import {
  ITreatmentCourseRepository,
  TreatmentCourseSearchOptions,
  VisitReminderSearchOptions,
  VisitReminderResult,
} from '../../../../domain/repositories/treatment-course.repository';
import { TreatmentCourse } from '../../../../domain/entities/treatment-course.entity';
import { TreatmentCourseStatus } from '../../../../domain/value-objects/treatment-course-status.vo';
import { getDb, Database } from '../../db/client';
import { treatmentCourses, patients, treatments, clinics, TreatmentCourseRow } from '../../db/schema';

@injectable()
export class D1TreatmentCourseRepository implements ITreatmentCourseRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<TreatmentCourse | null> {
    const row = await this.db.select().from(treatmentCourses).where(and(eq(treatmentCourses.id, id), eq(treatmentCourses.isDeleted, false))).get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<TreatmentCourse | null> {
    const row = await this.db
      .select()
      .from(treatmentCourses)
      .where(and(eq(treatmentCourses.id, id), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<TreatmentCourse[]> {
    const rows = await this.db.select().from(treatmentCourses).where(eq(treatmentCourses.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: TreatmentCourse): Promise<TreatmentCourse> {
    const now = new Date();
    const row: TreatmentCourseRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      patientId: entity.patientId,
      clinicId: entity.clinicId ?? null,
      treatmentId: entity.treatmentId,
      startDate: entity.startDate,
      expectedEndDate: entity.expectedEndDate ?? null,
      lastVisitDate: entity.lastVisitDate ?? null,
      nextVisitDate: entity.nextVisitDate ?? null,
      totalCost: entity.totalCost,
      totalPaid: entity.totalPaid,
      isPaymentCompleted: entity.isPaymentCompleted,
      isMedicallyCompleted: entity.isMedicallyCompleted,
      status: entity.status,
      notes: entity.notes ?? null,
      visits: entity.visits ?? [],
      payments: entity.payments ?? [],
      isDeleted: entity.isDeleted || false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(treatmentCourses).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<TreatmentCourse>): Promise<TreatmentCourse | null> {
    const data: Partial<TreatmentCourseRow> = { updatedAt: new Date() };
    if (entity.doctorId !== undefined) data.doctorId = entity.doctorId;
    if (entity.patientId !== undefined) data.patientId = entity.patientId;
    if (entity.clinicId !== undefined) data.clinicId = entity.clinicId || null;
    if (entity.treatmentId !== undefined) data.treatmentId = entity.treatmentId;
    if (entity.startDate !== undefined) data.startDate = entity.startDate;
    if (entity.expectedEndDate !== undefined) data.expectedEndDate = entity.expectedEndDate ?? null;
    if (entity.lastVisitDate !== undefined) data.lastVisitDate = entity.lastVisitDate ?? null;
    if (entity.nextVisitDate !== undefined) data.nextVisitDate = entity.nextVisitDate ?? null;
    if (entity.totalCost !== undefined) data.totalCost = entity.totalCost;
    if (entity.totalPaid !== undefined) data.totalPaid = entity.totalPaid;
    if (entity.isPaymentCompleted !== undefined) data.isPaymentCompleted = entity.isPaymentCompleted;
    if (entity.isMedicallyCompleted !== undefined) data.isMedicallyCompleted = entity.isMedicallyCompleted;
    if (entity.status !== undefined) data.status = entity.status;
    if (entity.notes !== undefined) data.notes = entity.notes ?? null;
    if (entity.visits !== undefined) data.visits = entity.visits;
    if (entity.payments !== undefined) data.payments = entity.payments;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(treatmentCourses)
      .set(data)
      .where(and(eq(treatmentCourses.id, id), eq(treatmentCourses.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(treatmentCourses)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(treatmentCourses.id, id), eq(treatmentCourses.isDeleted, false)))
      .returning({ id: treatmentCourses.id })
      .all();
    return rows.length > 0;
  }

  async findByPatientAndTreatmentAndStatus(
    doctorId: string,
    patientId: string,
    treatmentId: string,
    statuses: TreatmentCourseStatus[]
  ): Promise<TreatmentCourse | null> {
    const row = await this.db
      .select()
      .from(treatmentCourses)
      .where(
        and(
          eq(treatmentCourses.doctorId, doctorId),
          eq(treatmentCourses.patientId, patientId),
          eq(treatmentCourses.treatmentId, treatmentId),
          inArray(treatmentCourses.status, statuses),
          eq(treatmentCourses.isDeleted, false)
        )
      )
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findPaginated(options: TreatmentCourseSearchOptions): Promise<{
    treatmentCourses: TreatmentCourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, clinicId, treatmentId, patientId, status, startDateFrom, startDateTo, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(treatmentCourses.isDeleted, false), eq(treatmentCourses.doctorId, doctorId)];
    if (clinicId) conditions.push(eq(treatmentCourses.clinicId, clinicId));
    if (treatmentId) conditions.push(eq(treatmentCourses.treatmentId, treatmentId));
    if (patientId) conditions.push(eq(treatmentCourses.patientId, patientId));
    if (status) conditions.push(eq(treatmentCourses.status, status));
    if (startDateFrom) conditions.push(gte(treatmentCourses.startDate, startDateFrom));
    if (startDateTo) conditions.push(lte(treatmentCourses.startDate, startDateTo));
    const where = and(...conditions);

    const dir = sortOrder === 'asc' ? asc : desc;
    const sortCol =
      sortBy === 'startDate' ? treatmentCourses.startDate :
      sortBy === 'totalCost' ? treatmentCourses.totalCost :
      sortBy === 'status' ? treatmentCourses.status :
      treatmentCourses.createdAt;

    const rows = await this.db
      .select()
      .from(treatmentCourses)
      .where(where)
      .orderBy(dir(sortCol))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(treatmentCourses)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    return { treatmentCourses: rows.map((r) => this.toDomain(r)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async incrementTotalPaid(courseId: string, amount: number, _session?: unknown, paymentId?: string): Promise<TreatmentCourse | null> {
    const now = new Date().getTime();
    const pid = paymentId ?? null;
    await this.db.run(sql`
      UPDATE treatment_courses
      SET total_paid = total_paid + ${amount},
          is_payment_completed = (total_paid + ${amount} >= total_cost),
          payments = CASE
            WHEN ${pid} IS NULL THEN payments
            WHEN payments IS NULL THEN json_array(${pid})
            WHEN EXISTS (SELECT 1 FROM json_each(payments) WHERE value = ${pid}) THEN payments
            ELSE json_insert(payments, '$[#]', ${pid})
          END,
          updated_at = ${now}
      WHERE id = ${courseId} AND is_deleted = 0
    `);
    return this.findById(courseId);
  }

  async decrementTotalPaid(courseId: string, amount: number): Promise<TreatmentCourse | null> {
    const now = new Date().getTime();
    await this.db.run(sql`
      UPDATE treatment_courses
      SET total_paid = total_paid - ${amount},
          is_payment_completed = (total_paid - ${amount} >= total_cost),
          updated_at = ${now}
      WHERE id = ${courseId} AND is_deleted = 0
    `);
    return this.findById(courseId);
  }

  async markDeletedByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(treatmentCourses)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(treatmentCourses.patientId, patientId), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, false)))
      .returning({ id: treatmentCourses.id })
      .all();
    return rows.length;
  }

  async markRestoredByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(treatmentCourses)
      .set({ isDeleted: false, updatedAt: new Date() })
      .where(and(eq(treatmentCourses.patientId, patientId), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, true)))
      .returning({ id: treatmentCourses.id })
      .all();
    return rows.length;
  }

  async findVisitReminders(options: VisitReminderSearchOptions): Promise<{
    reminders: VisitReminderResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, daysBefore, daysAfter, treatmentIds, clinicIds } = options;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dateFrom: Date;
    let dateTo: Date;
    if (daysBefore >= 0 && daysAfter >= 0) {
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - daysBefore);
      dateTo = new Date(today);
      dateTo.setDate(dateTo.getDate() + daysAfter);
    } else {
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() + daysBefore);
      dateTo = new Date(today);
      dateTo.setDate(dateTo.getDate() + daysAfter);
      if (dateFrom > dateTo) {
        const temp = new Date(dateFrom);
        dateFrom = new Date(dateTo);
        dateTo = temp;
      }
    }
    dateTo.setHours(23, 59, 59, 999);

    const conditions: SQL[] = [
      eq(treatmentCourses.isDeleted, false),
      eq(treatmentCourses.doctorId, doctorId),
      eq(treatmentCourses.status, 'active'),
      isNotNull(treatmentCourses.nextVisitDate),
      gte(treatmentCourses.nextVisitDate, dateFrom),
      lte(treatmentCourses.nextVisitDate, dateTo),
    ];
    const validTreatmentIds = (treatmentIds ?? []).map((s) => s.trim()).filter(Boolean);
    if (validTreatmentIds.length > 0) conditions.push(inArray(treatmentCourses.treatmentId, validTreatmentIds));
    const validClinicIds = (clinicIds ?? []).map((s) => s.trim()).filter(Boolean);
    if (validClinicIds.length > 0) conditions.push(inArray(treatmentCourses.clinicId, validClinicIds));
    const where = and(...conditions);

    const rows = await this.db
      .select({
        treatmentCourseId: treatmentCourses.id,
        patientName: patients.fullName,
        treatmentName: treatments.name,
        clinicName: clinics.name,
        nextVisitDate: treatmentCourses.nextVisitDate,
      })
      .from(treatmentCourses)
      .innerJoin(patients, eq(treatmentCourses.patientId, patients.id))
      .innerJoin(treatments, eq(treatmentCourses.treatmentId, treatments.id))
      .leftJoin(clinics, eq(treatmentCourses.clinicId, clinics.id))
      .where(where)
      .orderBy(asc(treatmentCourses.nextVisitDate))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(treatmentCourses)
      .innerJoin(patients, eq(treatmentCourses.patientId, patients.id))
      .innerJoin(treatments, eq(treatmentCourses.treatmentId, treatments.id))
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    const reminders: VisitReminderResult[] = rows.map((r) => ({
      treatmentCourseId: r.treatmentCourseId,
      patientName: r.patientName ?? '',
      treatmentName: r.treatmentName,
      clinicName: r.clinicName ?? undefined,
      nextVisitDate: r.nextVisitDate as Date,
    }));

    return { reminders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private toDomain(row: TreatmentCourseRow): TreatmentCourse {
    return new TreatmentCourse(
      row.id,
      row.doctorId,
      row.patientId,
      row.treatmentId,
      row.startDate,
      row.totalCost,
      row.createdAt,
      row.updatedAt,
      row.clinicId ?? undefined,
      row.expectedEndDate ?? undefined,
      row.lastVisitDate ?? undefined,
      row.nextVisitDate ?? undefined,
      row.totalPaid,
      row.isPaymentCompleted,
      row.isMedicallyCompleted,
      row.status,
      row.notes ?? undefined,
      row.visits ?? [],
      row.payments ?? [],
      row.isDeleted
    );
  }
}

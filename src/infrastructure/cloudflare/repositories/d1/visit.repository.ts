import { injectable, inject } from 'tsyringe';
import { and, eq, gte, lte, like, asc, desc, sql, SQL } from 'drizzle-orm';
import {
  IVisitRepository,
  VisitSearchOptions,
  DailyActivitySearchOptions,
  DailyActivityAggregatedResult,
} from '../../../../domain/repositories/visit.repository';
import { Visit } from '../../../../domain/entities/visit.entity';
import { getDb, Database } from '../../db/client';
import { visits, patients, treatmentCourses, treatments, clinics, VisitRow } from '../../db/schema';

@injectable()
export class D1VisitRepository implements IVisitRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Visit | null> {
    const row = await this.db.select().from(visits).where(and(eq(visits.id, id), eq(visits.isDeleted, false))).get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Visit | null> {
    const row = await this.db
      .select()
      .from(visits)
      .where(and(eq(visits.id, id), eq(visits.doctorId, doctorId), eq(visits.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Visit[]> {
    const rows = await this.db.select().from(visits).where(eq(visits.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: Visit): Promise<Visit> {
    const now = new Date();
    const row: VisitRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      patientId: entity.patientId,
      courseId: entity.courseId,
      clinicId: entity.clinicId ?? null,
      visitDate: entity.visitDate,
      notes: entity.notes ?? null,
      billedAmount: entity.billedAmount ?? 0,
      mediaIds: entity.mediaIds ?? [],
      prescriptionId: entity.prescriptionId ?? null,
      isDeleted: entity.isDeleted || false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(visits).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Visit>): Promise<Visit | null> {
    const data: Partial<VisitRow> = { updatedAt: new Date() };
    if (entity.doctorId !== undefined) data.doctorId = entity.doctorId;
    if (entity.patientId !== undefined) data.patientId = entity.patientId;
    if (entity.courseId !== undefined) data.courseId = entity.courseId;
    if (entity.clinicId !== undefined) data.clinicId = entity.clinicId || null;
    if (entity.visitDate !== undefined) data.visitDate = entity.visitDate;
    if (entity.notes !== undefined) data.notes = entity.notes ?? null;
    if (entity.billedAmount !== undefined) data.billedAmount = entity.billedAmount ?? 0;
    if (entity.mediaIds !== undefined) data.mediaIds = entity.mediaIds;
    if (entity.prescriptionId !== undefined) data.prescriptionId = entity.prescriptionId || null;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(visits)
      .set(data)
      .where(and(eq(visits.id, id), eq(visits.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(visits)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(visits.id, id), eq(visits.isDeleted, false)))
      .returning({ id: visits.id })
      .all();
    return rows.length > 0;
  }

  async findPaginated(options: VisitSearchOptions): Promise<{
    visits: Visit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, courseId, clinicId, visitDateFrom, visitDateTo, notes, sortBy = 'visitDate', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(visits.isDeleted, false), eq(visits.doctorId, doctorId)];
    if (patientId) conditions.push(eq(visits.patientId, patientId));
    if (courseId) conditions.push(eq(visits.courseId, courseId));
    if (clinicId) conditions.push(eq(visits.clinicId, clinicId));
    if (visitDateFrom) conditions.push(gte(visits.visitDate, visitDateFrom));
    if (visitDateTo) conditions.push(lte(visits.visitDate, visitDateTo));
    if (notes && notes.trim().length > 0) conditions.push(like(visits.notes, `%${notes.trim()}%`));
    const where = and(...conditions);

    const dir = sortOrder === 'asc' ? asc : desc;
    const sortCol = sortBy === 'createdAt' ? visits.createdAt : visits.visitDate;

    const rows = await this.db
      .select()
      .from(visits)
      .where(where)
      .orderBy(dir(sortCol), dir(visits.id))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(visits)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    return { visits: rows.map((r) => this.toDomain(r)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDailyActivitiesAggregated(options: DailyActivitySearchOptions): Promise<DailyActivityAggregatedResult> {
    const { doctorId, date, page, limit, clinicId } = options;
    const skip = (page - 1) * limit;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conditions: SQL[] = [
      eq(visits.isDeleted, false),
      eq(visits.doctorId, doctorId),
      gte(visits.visitDate, startOfDay),
      lte(visits.visitDate, endOfDay),
    ];
    if (clinicId) conditions.push(eq(visits.clinicId, clinicId));

    const rows = await this.db
      .select({
        visitId: visits.id,
        visitTime: visits.visitDate,
        patientId: visits.patientId,
        patientName: patients.fullName,
        courseId: visits.courseId,
        treatmentName: treatments.name,
        billedAmount: visits.billedAmount,
        clinicId: visits.clinicId,
        clinicName: clinics.name,
      })
      .from(visits)
      .leftJoin(patients, eq(visits.patientId, patients.id))
      .leftJoin(treatmentCourses, eq(visits.courseId, treatmentCourses.id))
      .leftJoin(treatments, and(eq(treatmentCourses.treatmentId, treatments.id), eq(treatments.isDeleted, false)))
      .leftJoin(clinics, eq(visits.clinicId, clinics.id))
      .where(and(...conditions))
      .all();

    const emptySummary = {
      totalPatientsVisited: 0,
      totalVisits: 0,
      totalAmount: 0,
      averageAmountPerVisit: 0,
      visitStartTime: null as Date | null,
      visitEndTime: null as Date | null,
      totalHoursWorked: 0,
      clinicNames: [] as string[],
    };

    if (rows.length === 0) {
      return { summary: emptySummary, activities: [], total: 0, page, limit, totalPages: 0 };
    }

    const totalVisits = rows.length;
    const totalAmount = rows.reduce((s, r) => s + (r.billedAmount ?? 0), 0);
    const uniquePatients = new Set(rows.map((r) => r.patientId));
    const times = rows.map((r) => r.visitTime.getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const clinicNames = [...new Set(rows.map((r) => r.clinicName).filter((n): n is string => !!n))].sort();

    const summary = {
      totalPatientsVisited: uniquePatients.size,
      totalVisits,
      totalAmount,
      averageAmountPerVisit: totalVisits === 0 ? 0 : totalAmount / totalVisits,
      visitStartTime: new Date(minTime),
      visitEndTime: new Date(maxTime),
      totalHoursWorked: (maxTime - minTime) / 3600000,
      clinicNames,
    };

    const activities = [...rows]
      .sort((a, b) => a.visitTime.getTime() - b.visitTime.getTime() || a.visitId.localeCompare(b.visitId))
      .slice(skip, skip + limit)
      .map((r) => ({
        visitId: r.visitId,
        visitTime: r.visitTime,
        patientId: r.patientId,
        patientName: r.patientName ?? 'Unknown',
        courseId: r.courseId,
        treatmentName: r.treatmentName ?? 'Unknown',
        amountPaid: r.billedAmount ?? 0,
        clinicId: r.clinicId ?? null,
        clinicName: r.clinicName ?? null,
      }));

    return { summary, activities, total: totalVisits, page, limit, totalPages: Math.ceil(totalVisits / limit) };
  }

  async markDeletedByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(visits)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(visits.patientId, patientId), eq(visits.doctorId, doctorId), eq(visits.isDeleted, false)))
      .returning({ id: visits.id })
      .all();
    return rows.length;
  }

  async markRestoredByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(visits)
      .set({ isDeleted: false, updatedAt: new Date() })
      .where(and(eq(visits.patientId, patientId), eq(visits.doctorId, doctorId), eq(visits.isDeleted, true)))
      .returning({ id: visits.id })
      .all();
    return rows.length;
  }

  async getTotalVisitCount(doctorId: string, clinicId?: string): Promise<number> {
    const conditions: SQL[] = [eq(visits.doctorId, doctorId), eq(visits.isDeleted, false)];
    if (clinicId) conditions.push(eq(visits.clinicId, clinicId));

    const row = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(visits)
      .where(and(...conditions))
      .get();
    return row?.count ?? 0;
  }

  private toDomain(row: VisitRow): Visit {
    return new Visit(
      row.id,
      row.doctorId,
      row.patientId,
      row.courseId,
      row.visitDate,
      row.createdAt,
      row.updatedAt,
      row.clinicId ?? undefined,
      row.notes ?? undefined,
      row.billedAmount ?? undefined,
      row.mediaIds ?? [],
      row.prescriptionId ?? undefined,
      row.isDeleted
    );
  }
}

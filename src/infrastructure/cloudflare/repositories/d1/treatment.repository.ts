import { injectable, inject } from 'tsyringe';
import { and, or, eq, gte, lte, inArray, asc, sql, SQL } from 'drizzle-orm';
import {
  ITreatmentRepository,
  FindAllPaginatedOptions,
  TreatmentListResult,
  TreatmentStatisticsOptions,
  TreatmentStatistics,
  GetTreatmentImagesOptions,
} from '../../../../domain/repositories/treatment.repository';
import { Treatment } from '../../../../domain/entities/treatment.entity';
import { VisitIntervalUnit } from '../../../../domain/value-objects/visit-interval-unit.vo';
import { getDb, Database } from '../../db/client';
import { treatments, treatmentCourses, clinics, visits, payments, TreatmentRow } from '../../db/schema';
import { computeOverallStats, groupCourseSums, StatCourse } from './course-stats.util';

@injectable()
export class D1TreatmentRepository implements ITreatmentRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Treatment | null> {
    const row = await this.db.select().from(treatments).where(and(eq(treatments.id, id), eq(treatments.isDeleted, false))).get();
    return row ? this.toDomain(row, true) : null;
  }

  async findAll(): Promise<Treatment[]> {
    const rows = await this.db.select().from(treatments).where(eq(treatments.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async findAllActive(doctorId: string): Promise<Treatment[]> {
    const rows = await this.db
      .select()
      .from(treatments)
      .where(and(eq(treatments.isDeleted, false), eq(treatments.doctorId, doctorId)))
      .all();
    return rows.map((r) => this.toDomain(r));
  }

  async findByName(name: string, doctorId: string): Promise<Treatment | null> {
    const row = await this.db
      .select()
      .from(treatments)
      .where(and(eq(treatments.name, name.trim()), eq(treatments.doctorId, doctorId), eq(treatments.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    const conditions: SQL[] = [eq(treatments.isActive, true), eq(treatments.isDeleted, false), eq(treatments.doctorId, doctorId)];
    if (search && search.trim().length > 0) {
      const p = `%${search.trim().toLowerCase()}%`;
      conditions.push(or(sql`lower(${treatments.name}) LIKE ${p}`, sql`lower(${treatments.description}) LIKE ${p}`) as SQL);
    }
    return this.db
      .select({ id: treatments.id, name: treatments.name })
      .from(treatments)
      .where(and(...conditions))
      .orderBy(asc(treatments.name))
      .all();
  }

  async create(entity: Treatment): Promise<Treatment> {
    const now = new Date();
    const row: TreatmentRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      name: entity.name,
      description: entity.description ?? null,
      minDuration: entity.minDuration ?? null,
      maxDuration: entity.maxDuration ?? null,
      avgDuration: entity.avgDuration ?? null,
      minFees: entity.minFees ?? null,
      maxFees: entity.maxFees ?? null,
      avgFees: entity.avgFees ?? null,
      steps: entity.steps ?? null,
      aftercare: entity.aftercare ?? null,
      followUpRequired: entity.followUpRequired ?? false,
      followUpAfterDays: entity.followUpAfterDays ?? null,
      risks: entity.risks ?? null,
      images: entity.images ?? null,
      isOneTime: entity.isOneTime ?? null,
      regularVisitIntervalValue: entity.regularVisitInterval?.interval ?? null,
      regularVisitIntervalUnit: entity.regularVisitInterval?.unit ?? null,
      isActive: entity.isActive ?? true,
      isDeleted: entity.isDeleted ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(treatments).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Treatment>): Promise<Treatment | null> {
    const data: Partial<TreatmentRow> = { updatedAt: new Date() };
    if (entity.name !== undefined) data.name = entity.name;
    if (entity.description !== undefined) data.description = entity.description ?? null;
    if (entity.minDuration !== undefined) data.minDuration = entity.minDuration ?? null;
    if (entity.maxDuration !== undefined) data.maxDuration = entity.maxDuration ?? null;
    if (entity.avgDuration !== undefined) data.avgDuration = entity.avgDuration ?? null;
    if (entity.minFees !== undefined) data.minFees = entity.minFees ?? null;
    if (entity.maxFees !== undefined) data.maxFees = entity.maxFees ?? null;
    if (entity.avgFees !== undefined) data.avgFees = entity.avgFees ?? null;
    if (entity.steps !== undefined) data.steps = entity.steps ?? null;
    if (entity.aftercare !== undefined) data.aftercare = entity.aftercare ?? null;
    if (entity.followUpRequired !== undefined) data.followUpRequired = entity.followUpRequired;
    if (entity.followUpAfterDays !== undefined) data.followUpAfterDays = entity.followUpAfterDays ?? null;
    if (entity.risks !== undefined) data.risks = entity.risks ?? null;
    if (entity.images !== undefined) data.images = entity.images ?? null;
    if (entity.isOneTime !== undefined) data.isOneTime = entity.isOneTime ?? null;
    if (entity.regularVisitInterval !== undefined) {
      data.regularVisitIntervalValue = entity.regularVisitInterval?.interval ?? null;
      data.regularVisitIntervalUnit = entity.regularVisitInterval?.unit ?? null;
    }
    if (entity.isActive !== undefined) data.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(treatments)
      .set(data)
      .where(and(eq(treatments.id, id), eq(treatments.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(treatments)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(treatments.id, id), eq(treatments.isDeleted, false)))
      .returning({ id: treatments.id })
      .all();
    return rows.length > 0;
  }

  async findAllPaginated(options: FindAllPaginatedOptions): Promise<{ treatments: TreatmentListResult[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, sortBy = '', sortOrder = 'desc', search, doctorId } = options;

    const conditions: SQL[] = [eq(treatments.isDeleted, false), eq(treatments.doctorId, doctorId)];
    if (search && search.trim().length > 0) {
      const p = `%${search.trim().toLowerCase()}%`;
      conditions.push(or(sql`lower(${treatments.name}) LIKE ${p}`, sql`lower(${treatments.description}) LIKE ${p}`) as SQL);
    }

    const treatmentRows = await this.db.select().from(treatments).where(and(...conditions)).all();
    if (treatmentRows.length === 0) return { treatments: [], total: 0, page, limit, totalPages: 0 };

    const treatmentIds = treatmentRows.map((t) => t.id);
    const courseRows = await this.db
      .select({ treatmentId: treatmentCourses.treatmentId, status: treatmentCourses.status })
      .from(treatmentCourses)
      .where(and(inArray(treatmentCourses.treatmentId, treatmentIds), eq(treatmentCourses.isDeleted, false)))
      .all();

    const byTreatment = new Map<string, { count: number; ongoing: number; completed: number }>();
    for (const c of courseRows) {
      const e = byTreatment.get(c.treatmentId) ?? { count: 0, ongoing: 0, completed: 0 };
      e.count += 1;
      if (c.status === 'active') e.ongoing += 1;
      if (c.status === 'completed') e.completed += 1;
      byTreatment.set(c.treatmentId, e);
    }

    const list: Array<TreatmentListResult & { _createdAt: number }> = treatmentRows.map((t) => {
      const agg = byTreatment.get(t.id);
      return {
        id: t.id,
        name: t.name,
        isActive: t.isActive,
        avgFees: t.avgFees ?? undefined,
        avgDuration: t.avgDuration ?? undefined,
        numberOfPatients: agg ? agg.count : 0,
        ongoing: agg ? agg.ongoing : 0,
        completed: agg ? agg.completed : 0,
        _createdAt: t.createdAt.getTime(),
      };
    });

    const dir = sortOrder === 'asc' ? 1 : -1;
    const keyOf = (t: (typeof list)[number]): number => {
      switch (sortBy) {
        case 'averageAmount': return t.avgFees ?? 0;
        case 'averageDuration': return t.avgDuration ?? 0;
        case 'numberOfPatients': return t.numberOfPatients;
        case 'ongoing': return t.ongoing;
        case 'completed': return t.completed;
        default: return t._createdAt;
      }
    };
    list.sort((a, b) => (keyOf(a) - keyOf(b)) * dir);

    const total = list.length;
    const skip = (page - 1) * limit;
    const treatmentsList: TreatmentListResult[] = list.slice(skip, skip + limit).map(({ _createdAt, ...rest }) => rest);
    return { treatments: treatmentsList, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStatistics(treatmentId: string, options: TreatmentStatisticsOptions): Promise<TreatmentStatistics> {
    const { doctorId, startDateFrom, startDateTo, clinicId } = options;

    const conditions: SQL[] = [eq(treatmentCourses.treatmentId, treatmentId), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, false)];
    if (clinicId) conditions.push(eq(treatmentCourses.clinicId, clinicId));
    if (startDateFrom) conditions.push(gte(treatmentCourses.startDate, startDateFrom));
    if (startDateTo) conditions.push(lte(treatmentCourses.startDate, startDateTo));

    const courses = await this.db.select().from(treatmentCourses).where(and(...conditions)).all();
    if (courses.length === 0) return this.getEmptyStatistics();

    const courseIds = courses.map((c) => c.id);
    const visitRows = await this.db
      .select({ courseId: visits.courseId, billedAmount: visits.billedAmount })
      .from(visits)
      .where(and(inArray(visits.courseId, courseIds), eq(visits.isDeleted, false)))
      .all();
    const paymentRows = await this.db
      .select({ courseId: payments.courseId, amount: payments.amount, method: payments.method, refunded: payments.refunded, refundAmount: payments.refundAmount })
      .from(payments)
      .where(and(inArray(payments.courseId, courseIds), eq(payments.isDeleted, false)))
      .all();

    const statCourses: StatCourse[] = courses.map((c) => ({
      id: c.id,
      patientId: c.patientId,
      treatmentId: c.treatmentId,
      clinicId: c.clinicId,
      totalPaid: c.totalPaid,
      totalCost: c.totalCost,
      isMedicallyCompleted: c.isMedicallyCompleted,
      isPaymentCompleted: c.isPaymentCompleted,
      status: c.status,
      startDate: c.startDate,
      expectedEndDate: c.expectedEndDate,
    }));

    const overall = computeOverallStats(
      statCourses,
      visitRows.map((v) => ({ courseId: v.courseId, billedAmount: v.billedAmount ?? 0 })),
      paymentRows.map((p) => ({ courseId: p.courseId, amount: p.amount, method: p.method, refunded: p.refunded, refundAmount: p.refundAmount ?? 0 }))
    );

    const groups = groupCourseSums(statCourses, (c) => c.clinicId);
    const clinicIds = groups.map((g) => g.key);
    const clinicNameRows = clinicIds.length
      ? await this.db.select({ id: clinics.id, name: clinics.name }).from(clinics).where(inArray(clinics.id, clinicIds)).all()
      : [];
    const nameById = new Map(clinicNameRows.map((c) => [c.id, c.name]));
    const clinicsBreakdown = groups.map((g) => ({
      clinicId: g.key,
      clinicName: nameById.get(g.key) ?? 'Unknown Clinic',
      courseCount: g.courseCount,
      totalPaid: g.totalPaid,
      totalCost: g.totalCost,
      outstanding: g.totalCost - g.totalPaid,
    }));

    return { ...overall, clinics: clinicsBreakdown };
  }

  async addTreatmentImages(treatmentId: string, imageUrls: string[]): Promise<boolean> {
    if (!imageUrls || imageUrls.length === 0) return false;
    const row = await this.db.select({ images: treatments.images }).from(treatments).where(and(eq(treatments.id, treatmentId), eq(treatments.isDeleted, false))).get();
    if (!row) return false;
    const updated = [...(row.images ?? []), ...imageUrls];
    await this.db.update(treatments).set({ images: updated, updatedAt: new Date() }).where(eq(treatments.id, treatmentId)).run();
    return true;
  }

  async getTreatmentImages(treatmentId: string, options: GetTreatmentImagesOptions): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit } = options;
    const row = await this.db.select({ images: treatments.images }).from(treatments).where(and(eq(treatments.id, treatmentId), eq(treatments.isDeleted, false))).get();
    const all = row?.images ?? [];
    const total = all.length;
    if (total === 0) return { images: [], total: 0, page, limit, totalPages: 0 };
    const skip = (page - 1) * limit;
    return { images: all.slice(skip, skip + limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async deleteTreatmentImage(treatmentId: string, imageIndex: number): Promise<boolean> {
    if (imageIndex < 0) return false;
    const row = await this.db.select({ images: treatments.images }).from(treatments).where(and(eq(treatments.id, treatmentId), eq(treatments.isDeleted, false))).get();
    if (!row) return false;
    const images = row.images ?? [];
    if (imageIndex >= images.length) return false;
    const updated = [...images.slice(0, imageIndex), ...images.slice(imageIndex + 1)];
    await this.db.update(treatments).set({ images: updated, updatedAt: new Date() }).where(eq(treatments.id, treatmentId)).run();
    return true;
  }

  private getEmptyStatistics(): TreatmentStatistics {
    return {
      patients: { totalCount: 0, uniqueCount: 0 },
      treatmentCourses: { totalCount: 0, statusBreakdown: { active: 0, paused: 0, completed: 0, cancelled: 0 }, medicallyCompleted: 0, paymentCompleted: 0 },
      revenue: {
        totalPaid: 0, totalCost: 0, outstanding: 0,
        averagePerCourse: { paid: 0, cost: 0 },
        byPaymentMethod: { cash: 0, card: 0, upi: 0, bank: 0, insurance: 0, online: 0 },
        refunds: { totalAmount: 0, count: 0 },
      },
      clinics: [],
      visits: { totalCount: 0, averagePerCourse: 0, totalBilledAmount: 0, averageBilledAmount: 0 },
      timeMetrics: {},
      completionRates: { treatment: 0, payment: 0, medical: 0, cancellation: 0 },
    };
  }

  private toDomain(row: TreatmentRow, firstImageOnly = false): Treatment {
    const regularVisitInterval =
      row.regularVisitIntervalValue != null && row.regularVisitIntervalUnit != null
        ? { interval: row.regularVisitIntervalValue, unit: row.regularVisitIntervalUnit as VisitIntervalUnit }
        : undefined;

    const images = firstImageOnly
      ? (row.images && row.images.length > 0 ? [row.images[0]] : undefined)
      : (row.images ?? undefined);

    return new Treatment(
      row.id,
      row.doctorId,
      row.name,
      row.createdAt,
      row.updatedAt,
      row.description ?? undefined,
      row.minDuration ?? undefined,
      row.maxDuration ?? undefined,
      row.avgDuration ?? undefined,
      row.minFees ?? undefined,
      row.maxFees ?? undefined,
      row.avgFees ?? undefined,
      row.steps ?? undefined,
      row.aftercare ?? undefined,
      row.followUpRequired ?? undefined,
      row.followUpAfterDays ?? undefined,
      row.risks ?? undefined,
      images,
      row.isOneTime ?? undefined,
      regularVisitInterval,
      row.isDeleted,
      row.isActive
    );
  }
}

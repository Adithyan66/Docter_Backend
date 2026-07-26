import { injectable, inject } from 'tsyringe';
import { and, or, eq, gte, lte, inArray, asc, sql, SQL } from 'drizzle-orm';
import {
  IClinicRepository,
  FindAllPaginatedOptions,
  ClinicListResult,
  ClinicStatisticsOptions,
  ClinicStatistics,
  GetClinicImagesOptions,
} from '../../../../domain/repositories/clinic.repository';
import { Clinic } from '../../../../domain/entities/clinic.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { WorkingDay, DayOfWeek } from '../../../../domain/value-objects/working-day.vo';
import { getDb, Database } from '../../db/client';
import { clinics, treatments, treatmentCourses, visits, payments, ClinicRow } from '../../db/schema';
import { computeOverallStats, groupCourseSums, StatCourse } from './course-stats.util';

@injectable()
export class D1ClinicRepository implements IClinicRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  private async populateTreatments(ids: string[]): Promise<Array<{ id: string; name: string }>> {
    if (!ids || ids.length === 0) return [];
    const rows = await this.db
      .select({ id: treatments.id, name: treatments.name })
      .from(treatments)
      .where(and(inArray(treatments.id, ids), eq(treatments.isDeleted, false)))
      .all();
    const byId = new Map(rows.map((r) => [r.id, r.name]));
    return ids.filter((id) => byId.has(id)).map((id) => ({ id, name: byId.get(id)! }));
  }

  async findById(id: string): Promise<Clinic | null> {
    const row = await this.db.select().from(clinics).where(and(eq(clinics.id, id), eq(clinics.isDeleted, false))).get();
    if (!row) return null;
    const populated = await this.populateTreatments(row.treatments ?? []);
    return this.toDomain(row, populated);
  }

  async findByName(name: string, doctorId: string): Promise<Clinic | null> {
    const row = await this.db
      .select()
      .from(clinics)
      .where(and(eq(clinics.name, name.trim()), eq(clinics.doctorId, doctorId), eq(clinics.isDeleted, false)))
      .get();
    if (!row) return null;
    const populated = await this.populateTreatments(row.treatments ?? []);
    return this.toDomain(row, populated, true);
  }

  async findByClinicId(clinicId: string, doctorId: string): Promise<Clinic | null> {
    const row = await this.db
      .select()
      .from(clinics)
      .where(and(eq(clinics.clinicId, clinicId.toUpperCase()), eq(clinics.doctorId, doctorId), eq(clinics.isDeleted, false)))
      .get();
    if (!row) return null;
    const populated = await this.populateTreatments(row.treatments ?? []);
    return this.toDomain(row, populated, true);
  }

  async existsByClinicIdAndDoctorId(id: string, doctorId: string): Promise<boolean> {
    const row = await this.db
      .select({ id: clinics.id })
      .from(clinics)
      .where(and(eq(clinics.id, id), eq(clinics.doctorId, doctorId), eq(clinics.isDeleted, false)))
      .get();
    return !!row;
  }

  async findAll(): Promise<Clinic[]> {
    const rows = await this.db.select().from(clinics).where(eq(clinics.isDeleted, false)).all();
    return Promise.all(rows.map(async (r) => this.toDomain(r, await this.populateTreatments(r.treatments ?? []))));
  }

  async findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    const conditions: SQL[] = [eq(clinics.isActive, true), eq(clinics.isDeleted, false), eq(clinics.doctorId, doctorId)];
    if (search && search.trim().length > 0) {
      const p = `%${search.trim().toLowerCase()}%`;
      conditions.push(or(sql`lower(${clinics.name}) LIKE ${p}`, sql`lower(${clinics.city}) LIKE ${p}`) as SQL);
    }
    const rows = await this.db
      .select({ id: clinics.id, name: clinics.name })
      .from(clinics)
      .where(and(...conditions))
      .orderBy(asc(clinics.name))
      .all();
    return rows;
  }

  async create(entity: Clinic): Promise<Clinic> {
    const now = new Date();
    const row: ClinicRow = {
      id: entity.id || crypto.randomUUID(),
      clinicId: entity.clinicId.toUpperCase(),
      doctorId: entity.doctorId,
      name: entity.name,
      address: entity.address ?? null,
      city: entity.city ?? null,
      state: entity.state ?? null,
      pincode: entity.pincode ?? null,
      phone: entity.phone ?? null,
      email: entity.email ? entity.email.toString() : null,
      website: entity.website ?? null,
      locationUrl: entity.locationUrl ?? null,
      workingDays: entity.workingDays?.map((wd) => ({ day: wd.getDay(), startTime: wd.getStartTime(), endTime: wd.getEndTime() })) ?? null,
      treatments: entity.treatments ?? [],
      images: entity.images ?? null,
      notes: entity.notes ?? null,
      isActive: entity.isActive ?? true,
      isDeleted: entity.isDeleted ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(clinics).values(row).run();
    const populated = await this.populateTreatments(row.treatments ?? []);
    return this.toDomain(row, populated);
  }

  async update(id: string, entity: Partial<Clinic>): Promise<Clinic | null> {
    if (entity.clinicId !== undefined) throw new Error('clinicId cannot be updated');
    const data: Partial<ClinicRow> = { updatedAt: new Date() };
    if (entity.name !== undefined) data.name = entity.name;
    if (entity.address !== undefined) data.address = entity.address ?? null;
    if (entity.city !== undefined) data.city = entity.city ?? null;
    if (entity.state !== undefined) data.state = entity.state ?? null;
    if (entity.pincode !== undefined) data.pincode = entity.pincode ?? null;
    if (entity.phone !== undefined) data.phone = entity.phone ?? null;
    if (entity.email !== undefined) data.email = entity.email ? entity.email.toString() : null;
    if (entity.website !== undefined) data.website = entity.website ?? null;
    if (entity.locationUrl !== undefined) data.locationUrl = entity.locationUrl ?? null;
    if (entity.workingDays !== undefined) {
      data.workingDays = entity.workingDays.map((wd) => ({ day: wd.getDay(), startTime: wd.getStartTime(), endTime: wd.getEndTime() }));
    }
    if (entity.treatments !== undefined) data.treatments = entity.treatments;
    if (entity.images !== undefined) data.images = entity.images ?? null;
    if (entity.notes !== undefined) data.notes = entity.notes ?? null;
    if (entity.isActive !== undefined) data.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(clinics)
      .set(data)
      .where(and(eq(clinics.id, id), eq(clinics.isDeleted, false)))
      .returning()
      .get();
    if (!row) return null;
    const populated = await this.populateTreatments(row.treatments ?? []);
    return this.toDomain(row, populated);
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(clinics)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(clinics.id, id), eq(clinics.isDeleted, false)))
      .returning({ id: clinics.id })
      .all();
    return rows.length > 0;
  }

  async findAllPaginated(options: FindAllPaginatedOptions): Promise<{ clinics: ClinicListResult[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, search, doctorId, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const conditions: SQL[] = [eq(clinics.isDeleted, false), eq(clinics.doctorId, doctorId)];
    if (search && search.trim().length > 0) {
      const p = `%${search.trim().toLowerCase()}%`;
      conditions.push(or(sql`lower(${clinics.name}) LIKE ${p}`, sql`lower(${clinics.city}) LIKE ${p}`) as SQL);
    }

    const clinicRows = await this.db.select().from(clinics).where(and(...conditions)).all();
    if (clinicRows.length === 0) return { clinics: [], total: 0, page, limit, totalPages: 0 };

    const clinicIds = clinicRows.map((c) => c.id);
    const courseRows = await this.db
      .select({ clinicId: treatmentCourses.clinicId, patientId: treatmentCourses.patientId, status: treatmentCourses.status })
      .from(treatmentCourses)
      .where(and(eq(treatmentCourses.doctorId, doctorId), inArray(treatmentCourses.clinicId, clinicIds), eq(treatmentCourses.isDeleted, false)))
      .all();

    const byClinic = new Map<string, { patients: Set<string>; ongoing: number; completed: number }>();
    for (const c of courseRows) {
      if (!c.clinicId) continue;
      const e = byClinic.get(c.clinicId) ?? { patients: new Set<string>(), ongoing: 0, completed: 0 };
      e.patients.add(c.patientId);
      if (c.status === 'active') e.ongoing += 1;
      if (c.status === 'completed') e.completed += 1;
      byClinic.set(c.clinicId, e);
    }

    const list: ClinicListResult[] = clinicRows.map((c) => {
      const agg = byClinic.get(c.id);
      return {
        id: c.id,
        name: c.name,
        clinicId: c.clinicId,
        isActive: c.isActive,
        city: c.city ?? '',
        numOfPatients: agg ? agg.patients.size : 0,
        onGoingTreatments: agg ? agg.ongoing : 0,
        completedTreatments: agg ? agg.completed : 0,
      };
    });

    const dir = sortOrder === 'asc' ? 1 : -1;
    const sortKey = (c: ClinicListResult, row: ClinicRow): number | string => {
      switch (sortBy) {
        case 'numOfPatients': return c.numOfPatients;
        case 'onGoingTreatments': return c.onGoingTreatments;
        case 'completedTreatments': return c.completedTreatments;
        default: return row.createdAt.getTime();
      }
    };
    const rowById = new Map(clinicRows.map((r) => [r.id, r]));
    list.sort((a, b) => {
      const ka = sortKey(a, rowById.get(a.id)!);
      const kb = sortKey(b, rowById.get(b.id)!);
      if (ka < kb) return -dir;
      if (ka > kb) return dir;
      return 0;
    });

    const total = list.length;
    const skip = (page - 1) * limit;
    return { clinics: list.slice(skip, skip + limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStatistics(clinicId: string, options: ClinicStatisticsOptions): Promise<ClinicStatistics> {
    const { doctorId, startDateFrom, startDateTo, treatmentId } = options;

    const conditions: SQL[] = [eq(treatmentCourses.clinicId, clinicId), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, false)];
    if (treatmentId) conditions.push(eq(treatmentCourses.treatmentId, treatmentId));
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

    const groups = groupCourseSums(statCourses, (c) => c.treatmentId);
    const names = await this.populateTreatments(groups.map((g) => g.key));
    const nameById = new Map(names.map((n) => [n.id, n.name]));
    const treatmentsBreakdown = groups.map((g) => ({
      treatmentId: g.key,
      treatmentName: nameById.get(g.key) ?? 'Unknown Treatment',
      courseCount: g.courseCount,
      totalPaid: g.totalPaid,
      totalCost: g.totalCost,
      outstanding: g.totalCost - g.totalPaid,
    }));

    return { ...overall, treatments: treatmentsBreakdown };
  }

  async getClinicImages(clinicId: string, options: GetClinicImagesOptions): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit } = options;
    const row = await this.db.select({ images: clinics.images }).from(clinics).where(and(eq(clinics.id, clinicId), eq(clinics.isDeleted, false))).get();
    const all = row?.images ?? [];
    const total = all.length;
    if (total === 0) return { images: [], total: 0, page, limit, totalPages: 0 };
    const skip = (page - 1) * limit;
    return { images: all.slice(skip, skip + limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async deleteClinicImage(clinicId: string, imageIndex: number): Promise<boolean> {
    if (imageIndex < 0) return false;
    const row = await this.db.select({ images: clinics.images }).from(clinics).where(and(eq(clinics.id, clinicId), eq(clinics.isDeleted, false))).get();
    if (!row) return false;
    const images = row.images ?? [];
    if (imageIndex >= images.length) return false;
    const updated = [...images.slice(0, imageIndex), ...images.slice(imageIndex + 1)];
    await this.db.update(clinics).set({ images: updated, updatedAt: new Date() }).where(eq(clinics.id, clinicId)).run();
    return true;
  }

  async addClinicImages(clinicId: string, imageUrls: string[]): Promise<boolean> {
    if (!imageUrls || imageUrls.length === 0) return false;
    const row = await this.db.select({ images: clinics.images }).from(clinics).where(and(eq(clinics.id, clinicId), eq(clinics.isDeleted, false))).get();
    if (!row) return false;
    const updated = [...(row.images ?? []), ...imageUrls];
    await this.db.update(clinics).set({ images: updated, updatedAt: new Date() }).where(eq(clinics.id, clinicId)).run();
    return true;
  }

  private getEmptyStatistics(): ClinicStatistics {
    return {
      patients: { totalCount: 0, uniqueCount: 0 },
      treatmentCourses: { totalCount: 0, statusBreakdown: { active: 0, paused: 0, completed: 0, cancelled: 0 }, medicallyCompleted: 0, paymentCompleted: 0 },
      revenue: {
        totalPaid: 0, totalCost: 0, outstanding: 0,
        averagePerCourse: { paid: 0, cost: 0 },
        byPaymentMethod: { cash: 0, card: 0, upi: 0, bank: 0, insurance: 0, online: 0 },
        refunds: { totalAmount: 0, count: 0 },
      },
      treatments: [],
      visits: { totalCount: 0, averagePerCourse: 0, totalBilledAmount: 0, averageBilledAmount: 0 },
      timeMetrics: {},
      completionRates: { treatment: 0, payment: 0, medical: 0, cancellation: 0 },
    };
  }

  private toDomain(row: ClinicRow, populated: Array<{ id: string; name: string }>, firstImageOnly = false): Clinic {
    let email: Email | undefined;
    if (row.email) {
      try { email = new Email(row.email); } catch { email = undefined; }
    }

    let workingDays: WorkingDay[] | undefined;
    if (row.workingDays && row.workingDays.length > 0) {
      const mapped = row.workingDays
        .map((wd) => {
          try { return new WorkingDay(wd.day as DayOfWeek, wd.startTime, wd.endTime); } catch { return null; }
        })
        .filter((wd): wd is WorkingDay => wd !== null);
      workingDays = mapped.length > 0 ? mapped : undefined;
    }

    const treatmentIds = (row.treatments ?? []).length > 0 ? row.treatments ?? [] : undefined;
    const populatedTreatments = populated.length > 0 ? populated : undefined;

    const images = firstImageOnly
      ? (row.images && row.images.length > 0 ? [row.images[0]] : undefined)
      : (row.images ?? undefined);

    return new Clinic(
      row.id,
      row.clinicId,
      row.doctorId,
      row.name,
      row.createdAt,
      row.updatedAt,
      row.address ?? undefined,
      row.city ?? undefined,
      row.state ?? undefined,
      row.pincode ?? undefined,
      row.phone ?? undefined,
      email,
      row.website ?? undefined,
      row.locationUrl ?? undefined,
      workingDays,
      treatmentIds,
      populatedTreatments,
      images,
      row.notes ?? undefined,
      row.isActive,
      row.isDeleted
    );
  }
}

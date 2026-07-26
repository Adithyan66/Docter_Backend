import { injectable, inject } from 'tsyringe';
import { and, eq, gte, lte, asc, desc, sql, SQL } from 'drizzle-orm';
import {
  IPaymentRepository,
  PaymentSearchOptions,
  RevenueMetrics,
  RevenueTrendData,
  RevenueByPaymentMethodData,
  RevenueByClinicData,
  MonthlyRevenueData,
  PaymentCompletionStats,
} from '../../../../domain/repositories/payment.repository';
import { Payment } from '../../../../domain/entities/payment.entity';
import { PaymentMethodVO } from '../../../../domain/value-objects/payment-method.vo';
import { RefundDetails } from '../../../../domain/entities/refund-details.entity';
import { getDb, Database } from '../../db/client';
import { payments, clinics, treatmentCourses, PaymentRow } from '../../db/schema';

/**
 * paid_at is stored as epoch milliseconds, so every date bucket has to go through
 * `<col>/1000, 'unixepoch'`. Buckets are UTC: the Mongo original grouped in the
 * API server's local timezone, which Workers do not have.
 */
const bucket = (format: string): SQL<string> =>
  sql<string>`strftime(${format}, ${payments.paidAt} / 1000, 'unixepoch')`;

const startOfUtcMonth = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

const startOfUtcYear = (): Date => new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));

@injectable()
export class D1PaymentRepository implements IPaymentRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.db.select().from(payments).where(and(eq(payments.id, id), eq(payments.isDeleted, false))).get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Payment | null> {
    const row = await this.db
      .select()
      .from(payments)
      .where(and(eq(payments.id, id), eq(payments.doctorId, doctorId), eq(payments.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Payment[]> {
    const rows = await this.db.select().from(payments).where(eq(payments.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: Payment): Promise<Payment> {
    const now = new Date();
    const row: PaymentRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      patientId: entity.patientId,
      courseId: entity.courseId,
      visitId: entity.visitId ?? null,
      clinicId: entity.clinicId ?? null,
      amount: entity.amount,
      method: entity.method.getValue(),
      reference: entity.reference ?? null,
      paidAt: entity.paidAt,
      refunded: entity.refunded,
      refundRefundedAt: entity.refundDetails?.refundedAt ?? null,
      refundReason: entity.refundDetails?.refundReason ?? null,
      refundAmount: entity.refundDetails?.refundAmount ?? null,
      isDeleted: entity.isDeleted || false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(payments).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Payment>): Promise<Payment | null> {
    const data: Partial<PaymentRow> = { updatedAt: new Date() };
    if (entity.doctorId !== undefined) data.doctorId = entity.doctorId;
    if (entity.patientId !== undefined) data.patientId = entity.patientId;
    if (entity.courseId !== undefined) data.courseId = entity.courseId;
    if (entity.visitId !== undefined) data.visitId = entity.visitId || null;
    if (entity.clinicId !== undefined) data.clinicId = entity.clinicId || null;
    if (entity.amount !== undefined) data.amount = entity.amount;
    if (entity.method !== undefined) data.method = entity.method.getValue();
    if (entity.reference !== undefined) data.reference = entity.reference ?? null;
    if (entity.paidAt !== undefined) data.paidAt = entity.paidAt;
    if (entity.refunded !== undefined) data.refunded = entity.refunded;
    if (entity.refundDetails !== undefined) {
      data.refundRefundedAt = entity.refundDetails?.refundedAt ?? null;
      data.refundReason = entity.refundDetails?.refundReason ?? null;
      data.refundAmount = entity.refundDetails?.refundAmount ?? null;
    }
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(payments)
      .set(data)
      .where(and(eq(payments.id, id), eq(payments.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(payments)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(payments.id, id), eq(payments.isDeleted, false)))
      .returning({ id: payments.id })
      .all();
    return rows.length > 0;
  }

  async findPaginated(options: PaymentSearchOptions): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, courseId, clinicId, visitId, dateFrom, dateTo, method, refunded, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(payments.isDeleted, false), eq(payments.doctorId, doctorId)];
    if (patientId) conditions.push(eq(payments.patientId, patientId));
    if (courseId) conditions.push(eq(payments.courseId, courseId));
    if (clinicId) conditions.push(eq(payments.clinicId, clinicId));
    if (visitId) conditions.push(eq(payments.visitId, visitId));
    if (dateFrom) conditions.push(gte(payments.paidAt, dateFrom));
    if (dateTo) conditions.push(lte(payments.paidAt, dateTo));
    if (method) conditions.push(eq(payments.method, method));
    if (refunded !== undefined) conditions.push(eq(payments.refunded, refunded));
    const where = and(...conditions);

    const dir = sortOrder === 'asc' ? asc : desc;
    const sortCol = sortBy === 'paidAt' ? payments.paidAt : sortBy === 'amount' ? payments.amount : payments.createdAt;

    const rows = await this.db
      .select()
      .from(payments)
      .where(where)
      .orderBy(dir(sortCol))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(payments)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    return { payments: rows.map((r) => this.toDomain(r)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markDeletedByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(payments)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(payments.patientId, patientId), eq(payments.doctorId, doctorId), eq(payments.isDeleted, false)))
      .returning({ id: payments.id })
      .all();
    return rows.length;
  }

  async markRestoredByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(payments)
      .set({ isDeleted: false, updatedAt: new Date() })
      .where(and(eq(payments.patientId, patientId), eq(payments.doctorId, doctorId), eq(payments.isDeleted, true)))
      .returning({ id: payments.id })
      .all();
    return rows.length;
  }

  private toDomain(row: PaymentRow): Payment {
    const refundDetails = row.refundRefundedAt
      ? new RefundDetails(row.refundRefundedAt, row.refundAmount ?? 0, row.refundReason ?? undefined)
      : undefined;
    return new Payment(
      row.id,
      row.doctorId,
      row.patientId,
      row.courseId,
      row.amount,
      new PaymentMethodVO(row.method),
      row.paidAt,
      row.createdAt,
      row.updatedAt,
      row.visitId ?? undefined,
      row.clinicId ?? undefined,
      row.reference ?? undefined,
      row.refunded,
      refundDetails,
      row.isDeleted
    );
  }

  /** Revenue counts only settled money: not deleted, not refunded. */
  private revenueBase(doctorId: string, clinicId?: string): SQL[] {
    const conditions: SQL[] = [
      eq(payments.doctorId, doctorId),
      eq(payments.isDeleted, false),
      eq(payments.refunded, false),
    ];
    if (clinicId) conditions.push(eq(payments.clinicId, clinicId));
    return conditions;
  }

  private withRange(conditions: SQL[], dateFrom?: Date, dateTo?: Date): SQL[] {
    const next = [...conditions];
    if (dateFrom) next.push(gte(payments.paidAt, dateFrom));
    if (dateTo) next.push(lte(payments.paidAt, dateTo));
    return next;
  }

  private async sumWhere(conditions: SQL[]): Promise<number> {
    const row = await this.db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(and(...conditions))
      .get();
    return row?.total ?? 0;
  }

  async getRevenueMetrics(
    doctorId: string,
    dateFrom?: Date,
    dateTo?: Date,
    clinicId?: string
  ): Promise<RevenueMetrics> {
    const base = this.revenueBase(doctorId, clinicId);

    const [totalRevenue, revenueThisMonth, revenueThisYear] = await Promise.all([
      this.sumWhere(this.withRange(base, dateFrom, dateTo)),
      this.sumWhere([...base, gte(payments.paidAt, startOfUtcMonth())]),
      this.sumWhere([...base, gte(payments.paidAt, startOfUtcYear())]),
    ]);

    return { totalRevenue, revenueThisMonth, revenueThisYear };
  }

  async getRevenueTrend(
    doctorId: string,
    period: 'daily' | 'weekly' | 'monthly',
    dateFrom: Date,
    dateTo: Date,
    clinicId?: string
  ): Promise<RevenueTrendData[]> {
    const format = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';
    const label = bucket(format);

    const rows = await this.db
      .select({ date: label, amount: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(
        and(
          ...this.revenueBase(doctorId, clinicId),
          gte(payments.paidAt, dateFrom),
          lte(payments.paidAt, dateTo)
        )
      )
      .groupBy(label)
      .orderBy(asc(label))
      .all();

    return rows.map((r) => ({ date: r.date, amount: r.amount }));
  }

  async getRevenueByPaymentMethod(
    doctorId: string,
    dateFrom?: Date,
    dateTo?: Date,
    clinicId?: string
  ): Promise<RevenueByPaymentMethodData[]> {
    const rows = await this.db
      .select({
        method: payments.method,
        amount: sql<number>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(and(...this.withRange(this.revenueBase(doctorId, clinicId), dateFrom, dateTo)))
      .groupBy(payments.method)
      .all();

    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    return rows
      .map((r) => ({
        method: r.method,
        amount: r.amount,
        percentage: total > 0 ? (r.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  async getRevenueByClinic(
    doctorId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<RevenueByClinicData[]> {
    // Left join: payments with no clinic, or pointing at a removed one, still
    // contribute to revenue and surface under an "unknown" bucket.
    const rows = await this.db
      .select({
        clinicId: payments.clinicId,
        clinicName: clinics.name,
        amount: sql<number>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .leftJoin(clinics, eq(clinics.id, payments.clinicId))
      .where(and(...this.withRange(this.revenueBase(doctorId), dateFrom, dateTo)))
      .groupBy(payments.clinicId)
      .all();

    return rows
      .map((r) => ({
        clinicId: r.clinicId ?? 'unknown',
        clinicName: r.clinicName ?? 'Unknown Clinic',
        amount: r.amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  async getMonthlyRevenueComparison(
    doctorId: string,
    months: number,
    clinicId?: string
  ): Promise<MonthlyRevenueData[]> {
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1));
    const label = bucket('%Y-%m');

    const rows = await this.db
      .select({ month: label, amount: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(and(...this.revenueBase(doctorId, clinicId), gte(payments.paidAt, startDate)))
      .groupBy(label)
      .orderBy(asc(label))
      .all();

    return rows.map((r) => ({ month: r.month, amount: r.amount }));
  }

  async getPaymentCompletionStats(
    doctorId: string,
    clinicId?: string
  ): Promise<PaymentCompletionStats> {
    // Measured over treatment courses, not payment rows — a course counts as
    // complete once totalPaid covers totalCost.
    const conditions: SQL[] = [
      eq(treatmentCourses.doctorId, doctorId),
      eq(treatmentCourses.isDeleted, false),
    ];
    if (clinicId) conditions.push(eq(treatmentCourses.clinicId, clinicId));

    const row = await this.db
      .select({
        totalCount: sql<number>`count(*)`,
        completedCount: sql<number>`coalesce(sum(case when ${treatmentCourses.totalPaid} >= ${treatmentCourses.totalCost} then 1 else 0 end), 0)`,
      })
      .from(treatmentCourses)
      .where(and(...conditions))
      .get();

    const totalCount = row?.totalCount ?? 0;
    const completedCount = row?.completedCount ?? 0;
    return {
      completedCount,
      totalCount,
      rate: totalCount === 0 ? 0 : (completedCount / totalCount) * 100,
    };
  }
}

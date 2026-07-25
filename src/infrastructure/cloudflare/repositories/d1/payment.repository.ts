import { injectable, inject } from 'tsyringe';
import { and, eq, gte, lte, asc, desc, sql, SQL } from 'drizzle-orm';
import { IPaymentRepository, PaymentSearchOptions } from '../../../../domain/repositories/payment.repository';
import { Payment } from '../../../../domain/entities/payment.entity';
import { PaymentMethodVO } from '../../../../domain/value-objects/payment-method.vo';
import { RefundDetails } from '../../../../domain/entities/refund-details.entity';
import { getDb, Database } from '../../db/client';
import { payments, PaymentRow } from '../../db/schema';

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
}

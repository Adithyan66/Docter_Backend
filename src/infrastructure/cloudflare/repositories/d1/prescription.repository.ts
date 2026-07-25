import { injectable, inject } from 'tsyringe';
import { and, eq, gte, lte, asc, desc, sql, SQL } from 'drizzle-orm';
import { IPrescriptionRepository, PrescriptionSearchOptions } from '../../../../domain/repositories/prescription.repository';
import { Prescription } from '../../../../domain/entities/prescription.entity';
import { getDb, Database } from '../../db/client';
import { prescriptions, PrescriptionRow } from '../../db/schema';

@injectable()
export class D1PrescriptionRepository implements IPrescriptionRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Prescription | null> {
    const row = await this.db
      .select()
      .from(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Prescription | null> {
    const row = await this.db
      .select()
      .from(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.doctorId, doctorId), eq(prescriptions.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Prescription[]> {
    const rows = await this.db.select().from(prescriptions).where(eq(prescriptions.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: Prescription): Promise<Prescription> {
    const now = new Date();
    const row: PrescriptionRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctor,
      patientId: entity.patient,
      visitId: entity.visit,
      clinicId: entity.clinic ?? null,
      diagnosis: entity.diagnosis ?? [],
      items: entity.items ?? [],
      notes: entity.notes ?? null,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(prescriptions).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Prescription>): Promise<Prescription | null> {
    const data: Partial<PrescriptionRow> = { updatedAt: new Date() };
    if (entity.doctor !== undefined) data.doctorId = entity.doctor;
    if (entity.patient !== undefined) data.patientId = entity.patient;
    if (entity.visit !== undefined) data.visitId = entity.visit;
    if (entity.clinic !== undefined) data.clinicId = entity.clinic || null;
    if (entity.diagnosis !== undefined) data.diagnosis = entity.diagnosis;
    if (entity.items !== undefined) data.items = entity.items;
    if (entity.notes !== undefined) data.notes = entity.notes ?? null;

    const row = await this.db
      .update(prescriptions)
      .set(data)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(prescriptions)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(prescriptions.id, id), eq(prescriptions.isDeleted, false)))
      .returning({ id: prescriptions.id })
      .all();
    return rows.length > 0;
  }

  async findPaginated(options: PrescriptionSearchOptions): Promise<{
    prescriptions: Prescription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, visitId, clinicId, dateFrom, dateTo, medicineName, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(prescriptions.isDeleted, false), eq(prescriptions.doctorId, doctorId)];
    if (patientId) conditions.push(eq(prescriptions.patientId, patientId));
    if (visitId) conditions.push(eq(prescriptions.visitId, visitId));
    if (clinicId) conditions.push(eq(prescriptions.clinicId, clinicId));
    if (dateFrom) conditions.push(gte(prescriptions.createdAt, dateFrom));
    if (dateTo) conditions.push(lte(prescriptions.createdAt, dateTo));
    if (medicineName && medicineName.trim().length > 0) {
      const pattern = `%${medicineName.trim().toLowerCase()}%`;
      conditions.push(
        sql`EXISTS (SELECT 1 FROM json_each(${prescriptions.items}) je WHERE lower(json_extract(je.value, '$.medicineName')) LIKE ${pattern})`
      );
    }
    const where = and(...conditions);

    const dir = sortOrder === 'asc' ? asc : desc;
    const sortCol = sortBy === 'updatedAt' ? prescriptions.updatedAt : prescriptions.createdAt;

    const rows = await this.db
      .select()
      .from(prescriptions)
      .where(where)
      .orderBy(dir(sortCol), dir(prescriptions.id))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(prescriptions)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    return {
      prescriptions: rows.map((r) => this.toDomain(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toDomain(row: PrescriptionRow): Prescription {
    return new Prescription(
      row.id,
      row.doctorId,
      row.patientId,
      row.visitId,
      row.items ?? [],
      row.createdAt,
      row.updatedAt,
      row.clinicId ?? undefined,
      row.diagnosis ?? [],
      row.notes ?? undefined
    );
  }
}

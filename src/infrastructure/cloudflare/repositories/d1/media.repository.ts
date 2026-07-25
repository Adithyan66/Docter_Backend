import { injectable, inject } from 'tsyringe';
import { and, eq, asc, desc, sql, SQL } from 'drizzle-orm';
import { IMediaRepository, MediaSearchOptions } from '../../../../domain/repositories/media.repository';
import { Media } from '../../../../domain/entities/media.entity';
import { getDb, Database } from '../../db/client';
import { media, MediaRow } from '../../db/schema';

@injectable()
export class D1MediaRepository implements IMediaRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Media | null> {
    const row = await this.db
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Media | null> {
    const row = await this.db
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.doctorId, doctorId), eq(media.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Media[]> {
    const rows = await this.db.select().from(media).where(eq(media.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: Media): Promise<Media> {
    const now = new Date();
    const row: MediaRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      patientId: entity.patientId ?? null,
      courseId: entity.courseId ?? null,
      visitId: entity.visitId ?? null,
      clinicId: entity.clinicId ?? null,
      url: entity.url,
      filename: entity.filename ?? null,
      mimeType: entity.mimeType ?? null,
      size: entity.size ?? null,
      type: entity.type || 'image',
      notes: entity.notes ?? null,
      isDeleted: entity.isDeleted || false,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(media).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Media>): Promise<Media | null> {
    const data: Partial<MediaRow> = { updatedAt: new Date() };
    if (entity.doctorId !== undefined) data.doctorId = entity.doctorId;
    if (entity.patientId !== undefined) data.patientId = entity.patientId || null;
    if (entity.courseId !== undefined) data.courseId = entity.courseId || null;
    if (entity.visitId !== undefined) data.visitId = entity.visitId || null;
    if (entity.clinicId !== undefined) data.clinicId = entity.clinicId || null;
    if (entity.url !== undefined) data.url = entity.url;
    if (entity.filename !== undefined) data.filename = entity.filename ?? null;
    if (entity.mimeType !== undefined) data.mimeType = entity.mimeType ?? null;
    if (entity.size !== undefined) data.size = entity.size ?? null;
    if (entity.type !== undefined) data.type = entity.type;
    if (entity.notes !== undefined) data.notes = entity.notes ?? null;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(media)
      .set(data)
      .where(and(eq(media.id, id), eq(media.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(media)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(media.id, id), eq(media.isDeleted, false)))
      .returning({ id: media.id })
      .all();
    return rows.length > 0;
  }

  async findPaginated(options: MediaSearchOptions): Promise<{
    media: Media[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, courseId, visitId, clinicId, type, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(media.isDeleted, false), eq(media.doctorId, doctorId)];
    if (patientId) conditions.push(eq(media.patientId, patientId));
    if (courseId) conditions.push(eq(media.courseId, courseId));
    if (visitId) conditions.push(eq(media.visitId, visitId));
    if (clinicId) conditions.push(eq(media.clinicId, clinicId));
    if (type) conditions.push(eq(media.type, type));
    const where = and(...conditions);

    const dir = sortOrder === 'asc' ? asc : desc;
    const sortCol = sortBy === 'type' ? media.type : media.createdAt;

    const rows = await this.db
      .select()
      .from(media)
      .where(where)
      .orderBy(dir(sortCol), dir(media.id))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(media)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    return {
      media: rows.map((r) => this.toDomain(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markDeletedByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(media)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(media.patientId, patientId), eq(media.doctorId, doctorId), eq(media.isDeleted, false)))
      .returning({ id: media.id })
      .all();
    return rows.length;
  }

  async markRestoredByPatientId(patientId: string, doctorId: string): Promise<number> {
    const rows = await this.db
      .update(media)
      .set({ isDeleted: false, updatedAt: new Date() })
      .where(and(eq(media.patientId, patientId), eq(media.doctorId, doctorId), eq(media.isDeleted, true)))
      .returning({ id: media.id })
      .all();
    return rows.length;
  }

  private toDomain(row: MediaRow): Media {
    return new Media(
      row.id,
      row.doctorId,
      row.url,
      (row.type || 'image') as Media['type'],
      row.createdAt,
      row.updatedAt,
      row.patientId ?? undefined,
      row.courseId ?? undefined,
      row.visitId ?? undefined,
      row.clinicId ?? undefined,
      row.filename ?? undefined,
      row.mimeType ?? undefined,
      row.size ?? undefined,
      row.notes ?? undefined,
      row.isDeleted
    );
  }
}

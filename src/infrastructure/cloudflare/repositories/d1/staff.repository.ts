import { injectable, inject } from 'tsyringe';
import { and, eq, like, desc, sql } from 'drizzle-orm';
import {
  IStaffRepository,
  FindAllStaffPaginatedOptions,
  PaginatedStaffResult,
} from '../../../../domain/repositories/staff.repository';
import { Staff } from '../../../../domain/entities/staff.entity';
import { IPasswordService } from '../../../../application/interfaces/password-service.interface';
import { getDb, Database } from '../../db/client';
import { staff, clinics, StaffRow } from '../../db/schema';

@injectable()
export class D1StaffRepository implements IStaffRepository {
  private readonly db: Database;

  constructor(
    @inject('DB') d1: D1Database,
    @inject('IPasswordService') private readonly passwordService: IPasswordService
  ) {
    this.db = getDb(d1);
  }

  private async ensureHashed(password: string): Promise<string> {
    return password.startsWith('pbkdf2$') ? password : this.passwordService.hash(password);
  }

  async findById(id: string): Promise<Staff | null> {
    const row = await this.db.select().from(staff).where(eq(staff.id, id)).get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Staff[]> {
    const rows = await this.db.select().from(staff).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: Staff): Promise<Staff> {
    const now = new Date();
    const row: StaffRow = {
      id: entity.id || crypto.randomUUID(),
      username: entity.username.toLowerCase(),
      password: await this.ensureHashed(entity.password),
      clinicId: entity.clinicId,
      doctorId: entity.doctorId,
      role: 'staff',
      refreshToken: entity.refreshToken ?? null,
      isActive: entity.isActive,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(staff).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Staff>): Promise<Staff | null> {
    const updateData: Partial<StaffRow> = { updatedAt: new Date() };
    if (entity.username) updateData.username = entity.username.toLowerCase();
    if (entity.clinicId) updateData.clinicId = entity.clinicId;
    if (entity.doctorId) updateData.doctorId = entity.doctorId;
    if (entity.refreshToken !== undefined) updateData.refreshToken = entity.refreshToken ?? null;
    if (entity.isActive !== undefined) updateData.isActive = entity.isActive;
    if (entity.password) updateData.password = await this.ensureHashed(entity.password);

    const row = await this.db.update(staff).set(updateData).where(eq(staff.id, id)).returning().get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(staff).where(eq(staff.id, id)).returning({ id: staff.id }).all();
    return rows.length > 0;
  }

  async findByUsername(username: string): Promise<Staff | null> {
    const row = await this.db
      .select()
      .from(staff)
      .where(eq(staff.username, username.toLowerCase()))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findByDoctorId(doctorId: string): Promise<Staff[]> {
    const rows = await this.db.select().from(staff).where(eq(staff.doctorId, doctorId)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async findByClinicId(clinicId: string): Promise<Staff[]> {
    const rows = await this.db.select().from(staff).where(eq(staff.clinicId, clinicId)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.db
      .update(staff)
      .set({ refreshToken, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .run();
  }

  async findAllPaginated(options: FindAllStaffPaginatedOptions): Promise<PaginatedStaffResult> {
    const { doctorId, page, limit, username, clinicId, isActive } = options;
    const skip = (page - 1) * limit;

    const conditions = [eq(staff.doctorId, doctorId)];
    if (username) conditions.push(like(staff.username, `%${username.toLowerCase()}%`));
    if (clinicId) conditions.push(eq(staff.clinicId, clinicId));
    if (isActive !== undefined) conditions.push(eq(staff.isActive, isActive));
    const where = and(...conditions);

    const rows = await this.db
      .select({
        id: staff.id,
        username: staff.username,
        password: staff.password,
        clinicId: staff.clinicId,
        doctorId: staff.doctorId,
        refreshToken: staff.refreshToken,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        clinicName: clinics.name,
      })
      .from(staff)
      .leftJoin(clinics, eq(staff.clinicId, clinics.id))
      .where(where)
      .orderBy(desc(staff.createdAt))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(staff)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    const result = rows.map((r) => {
      const entity = new Staff(
        r.id,
        r.username,
        r.password,
        r.clinicId,
        r.doctorId,
        r.refreshToken,
        r.isActive,
        r.createdAt,
        r.updatedAt
      );
      return Object.assign(entity, { clinicName: r.clinicName ?? undefined });
    });

    return { staff: result, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private toDomain(row: StaffRow): Staff {
    return new Staff(
      row.id,
      row.username,
      row.password,
      row.clinicId,
      row.doctorId,
      row.refreshToken,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }
}

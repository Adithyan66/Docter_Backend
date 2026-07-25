import { injectable, inject } from 'tsyringe';
import { eq } from 'drizzle-orm';
import { IDoctorRepository } from '../../../../domain/repositories/doctor.repository';
import { Doctor } from '../../../../domain/entities/doctor.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { getDb, Database } from '../../db/client';
import { doctors, DoctorRow } from '../../db/schema';

@injectable()
export class D1DoctorRepository implements IDoctorRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Doctor | null> {
    const row = await this.db.select().from(doctors).where(eq(doctors.id, id)).get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Doctor[]> {
    const rows = await this.db.select().from(doctors).all();
    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: Doctor): Promise<Doctor> {
    const now = new Date();
    const row: DoctorRow = {
      id: entity.id || crypto.randomUUID(),
      email: entity.email.toString().toLowerCase(),
      password: entity.password,
      refreshToken: entity.refreshToken ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(doctors).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Doctor>): Promise<Doctor | null> {
    const updateData: Partial<DoctorRow> = { updatedAt: new Date() };
    if (entity.email) updateData.email = entity.email.toString().toLowerCase();
    if (entity.password) updateData.password = entity.password;
    if (entity.refreshToken !== undefined) updateData.refreshToken = entity.refreshToken ?? null;

    const row = await this.db
      .update(doctors)
      .set(updateData)
      .where(eq(doctors.id, id))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(doctors).where(eq(doctors.id, id)).returning({ id: doctors.id }).all();
    return rows.length > 0;
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    const row = await this.db
      .select()
      .from(doctors)
      .where(eq(doctors.email, email.toLowerCase()))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.db
      .update(doctors)
      .set({ refreshToken, updatedAt: new Date() })
      .where(eq(doctors.id, id))
      .run();
  }

  private toDomain(row: DoctorRow): Doctor {
    return new Doctor(
      row.id,
      new Email(row.email),
      row.password,
      row.createdAt,
      row.updatedAt,
      row.refreshToken ?? undefined
    );
  }
}

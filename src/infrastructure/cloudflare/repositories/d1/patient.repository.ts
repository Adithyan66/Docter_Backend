import { injectable, inject } from 'tsyringe';
import { and, or, eq, gte, lte, like, inArray, asc, desc, sql, SQL } from 'drizzle-orm';
import { IPatientRepository, PatientSearchOptions } from '../../../../domain/repositories/patient.repository';
import { Patient } from '../../../../domain/entities/patient.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Phone } from '../../../../domain/value-objects/phone.vo';
import { PatientId } from '../../../../domain/value-objects/patient-id.vo';
import { getDb, Database } from '../../db/client';
import { patients, clinics, PatientRow } from '../../db/schema';

@injectable()
export class D1PatientRepository implements IPatientRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async findById(id: string): Promise<Patient | null> {
    const row = await this.db.select().from(patients).where(and(eq(patients.id, id), eq(patients.isDeleted, false))).get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Patient | null> {
    const row = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId), eq(patients.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findByIdAndDoctorIncludingDeleted(id: string, doctorId: string): Promise<Patient | null> {
    const row = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Patient[]> {
    const rows = await this.db.select().from(patients).where(eq(patients.isDeleted, false)).all();
    return rows.map((r) => this.toDomain(r));
  }

  async findByPatientId(patientId: string): Promise<Patient | null> {
    const row = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.patientId, patientId.trim().toUpperCase()), eq(patients.isDeleted, false)))
      .get();
    return row ? this.toDomain(row) : null;
  }

  async create(entity: Patient): Promise<Patient> {
    const now = new Date();
    const row: PatientRow = {
      id: entity.id || crypto.randomUUID(),
      doctorId: entity.doctorId,
      primaryClinicId: entity.primaryClinic ?? null,
      patientId: entity.patientId ? entity.patientId.toString() : null,
      firstName: entity.firstName,
      lastName: entity.lastName ?? null,
      fullName: entity.fullName,
      dob: entity.dob ?? null,
      age: entity.age ?? null,
      gender: entity.gender,
      phone: entity.phone ? entity.phone.toString() : null,
      email: entity.email ? entity.email.toString() : null,
      address: entity.address ?? null,
      profilePicUrl: entity.profilePicUrl ?? null,
      consultationType: entity.consultationType,
      tags: entity.tags ?? [],
      clinics: entity.clinics ?? [],
      treatmentCourses: entity.treatmentCourses ?? [],
      visitCount: entity.visitCount,
      lastVisitAt: entity.lastVisitAt ?? null,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(patients).values(row).run();
    return this.toDomain(row);
  }

  async update(id: string, entity: Partial<Patient>): Promise<Patient | null> {
    const data: Partial<PatientRow> = { updatedAt: new Date() };
    if (entity.primaryClinic !== undefined) data.primaryClinicId = entity.primaryClinic || null;
    if (entity.clinics !== undefined) data.clinics = entity.clinics;
    if (entity.patientId !== undefined) data.patientId = entity.patientId ? entity.patientId.toString() : null;
    if (entity.firstName !== undefined) data.firstName = entity.firstName;
    if (entity.lastName !== undefined) data.lastName = entity.lastName ?? null;
    if (entity.fullName !== undefined) data.fullName = entity.fullName;
    if (entity.dob !== undefined) data.dob = entity.dob ?? null;
    if (entity.age !== undefined) data.age = entity.age ?? null;
    if (entity.gender !== undefined) data.gender = entity.gender;
    if (entity.phone !== undefined) data.phone = entity.phone ? entity.phone.toString() : null;
    if (entity.email !== undefined) data.email = entity.email ? entity.email.toString() : null;
    if (entity.address !== undefined) data.address = entity.address ?? null;
    if (entity.profilePicUrl !== undefined) data.profilePicUrl = entity.profilePicUrl ?? null;
    if (entity.consultationType !== undefined) data.consultationType = entity.consultationType;
    if (entity.tags !== undefined) data.tags = entity.tags;
    if (entity.treatmentCourses !== undefined) data.treatmentCourses = entity.treatmentCourses;
    if (entity.visitCount !== undefined) data.visitCount = entity.visitCount;
    if (entity.lastVisitAt !== undefined) data.lastVisitAt = entity.lastVisitAt ?? null;
    if (entity.isActive !== undefined) data.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) data.isDeleted = entity.isDeleted;

    const row = await this.db
      .update(patients)
      .set(data)
      .where(and(eq(patients.id, id), eq(patients.isDeleted, false)))
      .returning()
      .get();
    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(patients)
      .set({ isDeleted: true, isActive: false, updatedAt: new Date() })
      .where(and(eq(patients.id, id), eq(patients.isDeleted, false)))
      .returning({ id: patients.id })
      .all();
    return rows.length > 0;
  }

  async findPaginated(options: PatientSearchOptions): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    clinicNames?: Record<string, string>;
  }> {
    const { page, limit, doctorId, search, patientId, clinicId, gender, consultationType, minAge, maxAge, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(patients.isDeleted, false), eq(patients.doctorId, doctorId)];

    if (search && search.trim().length > 0) {
      const p = `%${search.trim().toLowerCase()}%`;
      conditions.push(or(sql`lower(${patients.fullName}) LIKE ${p}`, sql`lower(${patients.patientId}) LIKE ${p}`) as SQL);
    }
    if (patientId && patientId.trim().length > 0) conditions.push(eq(patients.patientId, patientId.trim().toUpperCase()));
    if (clinicId) {
      conditions.push(
        or(
          eq(patients.primaryClinicId, clinicId),
          sql`EXISTS (SELECT 1 FROM json_each(${patients.clinics}) WHERE value = ${clinicId})`
        ) as SQL
      );
    }
    if (gender) conditions.push(eq(patients.gender, gender));
    if (consultationType) conditions.push(eq(patients.consultationType, consultationType));
    if (minAge !== undefined) conditions.push(gte(patients.age, minAge));
    if (maxAge !== undefined) conditions.push(lte(patients.age, maxAge));
    const where = and(...conditions);

    const dir = sortOrder === 'asc' ? asc : desc;
    const sortCol =
      sortBy === 'fullName' ? patients.fullName :
      sortBy === 'visitCount' ? patients.visitCount :
      sortBy === 'lastVisitAt' ? patients.lastVisitAt :
      patients.createdAt;

    const rows = await this.db
      .select()
      .from(patients)
      .where(where)
      .orderBy(dir(sortCol), dir(patients.id))
      .limit(limit)
      .offset(skip)
      .all();

    const totalRow = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(patients)
      .where(where)
      .get();
    const total = totalRow?.count ?? 0;

    const clinicNames: Record<string, string> = {};
    const primaryIds = [...new Set(rows.map((r) => r.primaryClinicId).filter((c): c is string => !!c))];
    if (primaryIds.length > 0) {
      const clinicRows = await this.db
        .select({ id: clinics.id, name: clinics.name })
        .from(clinics)
        .where(inArray(clinics.id, primaryIds))
        .all();
      const nameById = new Map(clinicRows.map((c) => [c.id, c.name]));
      for (const r of rows) {
        if (r.primaryClinicId) {
          const name = nameById.get(r.primaryClinicId);
          if (name) clinicNames[r.id] = name;
        }
      }
    }

    return { patients: rows.map((r) => this.toDomain(r)), total, page, limit, totalPages: Math.ceil(total / limit), clinicNames };
  }

  private safeEmail(v: string | null): Email | undefined {
    if (!v) return undefined;
    try { return new Email(v); } catch { return undefined; }
  }

  private safePhone(v: string | null): Phone | undefined {
    if (!v) return undefined;
    try { return new Phone(v); } catch { return undefined; }
  }

  private safePatientId(v: string | null): PatientId | undefined {
    if (!v) return undefined;
    try { return new PatientId(v); } catch { return undefined; }
  }

  async getActivePatientCount(doctorId: string, clinicId?: string): Promise<number> {
    const conditions: SQL[] = [
      eq(patients.doctorId, doctorId),
      eq(patients.isDeleted, false),
      eq(patients.isActive, true),
    ];
    if (clinicId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM json_each(${patients.clinics}) WHERE value = ${clinicId})`
      );
    }

    const row = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(and(...conditions))
      .get();
    return row?.count ?? 0;
  }

  private toDomain(row: PatientRow): Patient {
    return new Patient(
      row.id,
      row.doctorId,
      row.firstName,
      row.consultationType,
      row.createdAt,
      row.updatedAt,
      row.primaryClinicId ?? undefined,
      row.clinics ?? [],
      this.safePatientId(row.patientId),
      row.lastName ?? undefined,
      row.fullName ?? undefined,
      row.dob ?? undefined,
      row.age ?? undefined,
      row.gender ?? undefined,
      this.safePhone(row.phone),
      this.safeEmail(row.email),
      row.address ?? undefined,
      row.profilePicUrl ?? undefined,
      row.tags ?? [],
      row.treatmentCourses ?? [],
      row.visitCount,
      row.lastVisitAt ?? undefined,
      row.isActive,
      row.isDeleted
    );
  }
}

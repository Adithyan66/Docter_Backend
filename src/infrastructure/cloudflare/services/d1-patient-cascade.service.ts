import { injectable, inject } from 'tsyringe';
import { and, eq } from 'drizzle-orm';
import { IPatientCascade } from '../../../application/interfaces/patient-cascade.interface';
import { getDb, Database } from '../db/client';
import { patients, visits, treatmentCourses, payments, media } from '../db/schema';

/**
 * Atomic patient soft-delete/restore cascade. D1 `db.batch()` runs all
 * statements in a single implicit transaction (all-or-nothing) — the one place
 * D1 gives cross-statement atomicity, and these cascades have no inter-step
 * data dependencies so they fit it.
 */
@injectable()
export class D1PatientCascadeService implements IPatientCascade {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async softDelete(patientId: string, doctorId: string): Promise<void> {
    const now = new Date();
    await this.db.batch([
      this.db.update(patients).set({ isDeleted: true, isActive: false, updatedAt: now }).where(and(eq(patients.id, patientId), eq(patients.doctorId, doctorId))),
      this.db.update(visits).set({ isDeleted: true, updatedAt: now }).where(and(eq(visits.patientId, patientId), eq(visits.doctorId, doctorId), eq(visits.isDeleted, false))),
      this.db.update(treatmentCourses).set({ isDeleted: true, updatedAt: now }).where(and(eq(treatmentCourses.patientId, patientId), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, false))),
      this.db.update(payments).set({ isDeleted: true, updatedAt: now }).where(and(eq(payments.patientId, patientId), eq(payments.doctorId, doctorId), eq(payments.isDeleted, false))),
      this.db.update(media).set({ isDeleted: true, updatedAt: now }).where(and(eq(media.patientId, patientId), eq(media.doctorId, doctorId), eq(media.isDeleted, false))),
    ]);
  }

  async restore(patientId: string, doctorId: string): Promise<void> {
    const now = new Date();
    await this.db.batch([
      this.db.update(patients).set({ isDeleted: false, isActive: true, updatedAt: now }).where(and(eq(patients.id, patientId), eq(patients.doctorId, doctorId))),
      this.db.update(visits).set({ isDeleted: false, updatedAt: now }).where(and(eq(visits.patientId, patientId), eq(visits.doctorId, doctorId), eq(visits.isDeleted, true))),
      this.db.update(treatmentCourses).set({ isDeleted: false, updatedAt: now }).where(and(eq(treatmentCourses.patientId, patientId), eq(treatmentCourses.doctorId, doctorId), eq(treatmentCourses.isDeleted, true))),
      this.db.update(payments).set({ isDeleted: false, updatedAt: now }).where(and(eq(payments.patientId, patientId), eq(payments.doctorId, doctorId), eq(payments.isDeleted, true))),
      this.db.update(media).set({ isDeleted: false, updatedAt: now }).where(and(eq(media.patientId, patientId), eq(media.doctorId, doctorId), eq(media.isDeleted, true))),
    ]);
  }
}

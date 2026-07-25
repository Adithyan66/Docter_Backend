import { injectable, inject } from 'tsyringe';
import { sql } from 'drizzle-orm';
import { IPatientIdCounterRepository } from '../../../../domain/repositories/patient-id-counter.repository';
import { getDb, Database } from '../../db/client';
import { patientIdCounters } from '../../db/schema';

@injectable()
export class D1PatientIdCounterRepository implements IPatientIdCounterRepository {
  private readonly db: Database;

  constructor(@inject('DB') d1: D1Database) {
    this.db = getDb(d1);
  }

  async getNextSequence(clinicCode: string): Promise<number> {
    const normalized = clinicCode.trim().toUpperCase();

    const row = await this.db
      .insert(patientIdCounters)
      .values({ clinicId: normalized, sequence: 1, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: patientIdCounters.clinicId,
        set: { sequence: sql`${patientIdCounters.sequence} + 1`, updatedAt: new Date() },
      })
      .returning({ sequence: patientIdCounters.sequence })
      .get();

    return row?.sequence ?? 1;
  }
}

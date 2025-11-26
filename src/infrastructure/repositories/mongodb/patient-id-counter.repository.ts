import { injectable } from 'tsyringe';
import { IPatientIdCounterRepository } from '../../../domain/repositories/patient-id-counter.repository';
import { PatientIdCounterModel } from '../../database/mongoose/patient-counter.model';

@injectable()
export class MongoPatientIdCounterRepository implements IPatientIdCounterRepository {
  async getNextSequence(clinicCode: string): Promise<number> {
    const normalized = clinicCode.trim().toUpperCase();

    const doc = await PatientIdCounterModel.findByIdAndUpdate(
      normalized,
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!doc) {
      // Should never happen because of upsert, but fallback to 1
      return 1;
    }

    return doc.sequence;
  }
}


